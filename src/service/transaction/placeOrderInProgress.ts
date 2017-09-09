/**
 * placeOrder in progress transaction service
 * 進行中注文取引サービス
 * @namespace service/transaction/placeOrderInProgress
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { MongoRepository as ActionRepository } from '../../repo/action';
import { MongoRepository as OrganizationRepository } from '../../repo/organization';
import { MongoRepository as TransactionRepository } from '../../repo/transaction';
import { MongoRepository as TransactionCountRepository } from '../../repo/transactionCount';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');

export type ITransactionOperation<T> = (transactionRepository: TransactionRepository) => Promise<T>;
export type IOrganizationAndTransactionOperation<T> = (
    organizationRepository: OrganizationRepository,
    transactionRepository: TransactionRepository
) => Promise<T>;
export type IOrganizationAndTransactionAndTransactionCountOperation<T> = (
    organizationRepository: OrganizationRepository,
    transactionRepository: TransactionRepository,
    transactionCountRepository: TransactionCountRepository
) => Promise<T>;
export type IActionAndTransactionOperation<T> = (
    actionRepository: ActionRepository,
    transactionRepository: TransactionRepository
) => Promise<T>;
export type IActionAndOrganizationAndTransactionOperation<T> = (
    actionRepository: ActionRepository,
    organizationRepository: OrganizationRepository,
    transactionRepository: TransactionRepository
) => Promise<T>;

/**
 * 取引開始
 */
export function start(args: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: factory.clientUser.IClientUser;
    scope: factory.transactionScope.ITransactionScope;
    agentId: string;
    sellerId: string;
}): IOrganizationAndTransactionAndTransactionCountOperation<factory.transaction.placeOrder.ITransaction> {
    return async (
        // personRepository: PersonRepository,
        organizationRepository: OrganizationRepository,
        transactionRepository: TransactionRepository,
        transactionCountRepository: TransactionCountRepository
    ) => {
        // 利用可能かどうか
        const nextCount = await transactionCountRepository.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            throw new factory.errors.NotFound('available transaction');
        }

        const agent: factory.transaction.placeOrder.IAgent = {
            typeOf: 'Person',
            id: args.agentId,
            url: ''
        };
        if (args.clientUser.username !== undefined) {
            agent.memberOf = {
                membershipNumber: args.agentId,
                programName: 'Amazon Cognito'
            };
        }

        // 売り手を取得
        const seller = await organizationRepository.findMovieTheaterById(args.sellerId);

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = factory.transaction.placeOrder.create({
            id: mongoose.Types.ObjectId().toString(),
            status: factory.transactionStatusType.InProgress,
            agent: agent,
            seller: {
                // tslint:disable-next-line:no-suspicious-comment
                // TODO enum管理
                typeOf: 'MovieTheater',
                id: seller.id,
                name: seller.name.ja,
                url: seller.url
            },
            object: {
                clientUser: args.clientUser,
                paymentInfos: [],
                discountInfos: []
            },
            expires: args.expires,
            startDate: moment().toDate()
        });

        await transactionRepository.startPlaceOrder(transaction);

        return transaction;
    };
}

/**
 * オーソリを取得するクレジットカード情報インターフェース
 */
export type ICreditCard4authorizeAction =
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardRaw |
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized |
    factory.paymentMethod.paymentCard.creditCard.IUnauthorizedCardOfMember;

/**
 * クレジットカードオーソリ取得
 */
// tslint:disable-next-line:max-func-body-length
export function createCreditCardAuthorization(
    agentId: string,
    transactionId: string,
    orderId: string,
    amount: number,
    method: GMO.utils.util.Method,
    creditCard: ICreditCard4authorizeAction
): IActionAndOrganizationAndTransactionOperation<factory.action.authorize.creditCard.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        actionRepository: ActionRepository,
        organizationRepository: OrganizationRepository,
        transactionRepository: TransactionRepository
    ) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // GMOショップ情報取得
        const movieTheater = await organizationRepository.findMovieTheaterById(transaction.seller.id);

        // 承認アクションを開始する
        let action = factory.action.authorize.creditCard.create({
            id: mongoose.Types.ObjectId().toString(),
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: {
                transactionId: transactionId,
                orderId: orderId,
                amount: amount,
                method: method,
                payType: GMO.utils.util.PayType.Credit
            },
            result: <any>{},
            agent: transaction.agent,
            recipient: transaction.seller,
            startDate: new Date()
        });
        await actionRepository.actionModel.create({ ...action, ...{ _id: action.id } });

        // GMOオーソリ取得
        let entryTranArgs: GMO.services.credit.IEntryTranArgs;
        let execTranArgs: GMO.services.credit.IExecTranArgs;
        let entryTranResult: GMO.services.credit.IEntryTranResult;
        let execTranResult: GMO.services.credit.IExecTranResult;
        try {
            entryTranArgs = {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                jobCd: GMO.utils.util.JobCd.Auth,
                amount: amount
            };
            entryTranResult = await GMO.services.credit.entryTran(entryTranArgs);
            debug('entryTranResult:', entryTranResult);

            execTranArgs = {
                ...{
                    accessId: entryTranResult.accessId,
                    accessPass: entryTranResult.accessPass,
                    orderId: orderId,
                    method: method,
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS
                },
                ...creditCard,
                ...{
                    seqMode: GMO.utils.util.SeqMode.Physics
                }
            };
            execTranResult = await GMO.services.credit.execTran(execTranArgs);
            debug('execTranResult:', execTranResult);
        } catch (error) {
            console.error('fail at entryTran or execTran', error);

            // tslint:disable-next-line:no-suspicious-comment
            // TODO actionにエラー結果を追加

            if (error.name === 'GMOServiceBadRequestError') {
                // consider E92000001,E92000002
                // GMO流量制限オーバーエラーの場合
                const serviceUnavailableError = error.errors.find((gmoError: any) => gmoError.info.match(/^E92000001|E92000002$/));
                if (serviceUnavailableError !== undefined) {
                    throw new factory.errors.ServiceUnavailable('payment service unavailable temporarily');
                } else {
                    throw new factory.errors.Argument('payment');
                }
            }

            throw new Error(error);
        }

        // アクションを完了
        debug('ending authorize action...');
        action = await actionRepository.actionModel.findByIdAndUpdate(
            action.id,
            {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: {
                    price: amount,
                    entryTranArgs: entryTranArgs,
                    execTranArgs: execTranArgs,
                    execTranResult: execTranResult
                },
                endDate: new Date()
            },
            { new: true }
        ).exec().then((doc) => <factory.action.authorize.creditCard.IAction>(<mongoose.Document>doc).toObject());
        debug('GMO authorize action ended.');

        return action;
    };
}

export function cancelGMOAuthorization(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        const action = await actionRepository.actionModel.findOne({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.CreditCard
        }).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('actionId', '指定されたオーソリは見つかりません');

                }

                return <any>doc.toObject();
            });

        // 決済取消
        await GMO.services.credit.alterTran({
            shopId: action.result.entryTranArgs.shopId,
            shopPass: action.result.entryTranArgs.shopPass,
            accessId: action.result.execTranArgs.accessId,
            accessPass: action.result.execTranArgs.accessPass,
            jobCd: GMO.utils.util.JobCd.Void
        });
        debug('alterTran processed', GMO.utils.util.JobCd.Void);

        await actionRepository.actionModel.findByIdAndUpdate(
            actionId,
            {
                actionStatus: factory.actionStatusType.CanceledActionStatus
            }
        ).exec();
    };
}

export function createSeatReservationAuthorization(
    agentId: string,
    transactionId: string,
    individualScreeningEvent: factory.event.individualScreeningEvent.IEvent,
    offers: factory.offer.ISeatReservationOffer[]
): IActionAndTransactionOperation<factory.action.authorize.seatReservation.IAction> {
    return async (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        let action = factory.action.authorize.seatReservation.createFromCOATmpReserve({
            id: mongoose.Types.ObjectId().toString(),
            transactionId: transactionId,
            agent: transaction.seller,
            recipient: transaction.agent,
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            startDate: new Date(),
            offers: offers,
            individualScreeningEvent: individualScreeningEvent
        });
        await actionRepository.actionModel.create({ ...action, ...{ _id: action.id } });

        // todo 座席コードがすでにキープ済みのものかどうかチェックできる？

        // COA仮予約
        const updTmpReserveSeatArgs = {
            theaterCode: individualScreeningEvent.coaInfo.theaterCode,
            dateJouei: individualScreeningEvent.coaInfo.dateJouei,
            titleCode: individualScreeningEvent.coaInfo.titleCode,
            titleBranchNum: individualScreeningEvent.coaInfo.titleBranchNum,
            timeBegin: individualScreeningEvent.coaInfo.timeBegin,
            screenCode: individualScreeningEvent.coaInfo.screenCode,
            listSeat: offers.map((offer) => {
                return {
                    seatSection: offer.seatSection,
                    seatNum: offer.seatNumber
                };
            })
        };
        debug('updTmpReserveSeat processing...', updTmpReserveSeatArgs);
        const updTmpReserveSeatResult = await COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
        debug('updTmpReserveSeat processed', updTmpReserveSeatResult);

        // COAオーソリ追加
        // アクションを完了
        debug('ending authorize action...');
        const price = offers.reduce((a, b) => a + b.ticketInfo.salePrice + b.ticketInfo.mvtkSalesPrice, 0);
        const acceptedOffers = factory.reservation.event.createFromCOATmpReserve({
            reserveSeatsTemporarilyResult: updTmpReserveSeatResult,
            offers: offers,
            individualScreeningEvent: individualScreeningEvent
        }).map((eventReservation) => {
            return {
                itemOffered: eventReservation,
                price: eventReservation.price,
                priceCurrency: factory.priceCurrency.JPY,
                seller: {
                    typeOf: individualScreeningEvent.superEvent.location.typeOf,
                    name: individualScreeningEvent.superEvent.location.name.ja
                }
            };
        });
        action = await actionRepository.actionModel.findByIdAndUpdate(
            action.id,
            {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: {
                    price: price,
                    acceptedOffers: acceptedOffers,
                    updTmpReserveSeatArgs: updTmpReserveSeatArgs,
                    updTmpReserveSeatResult: updTmpReserveSeatResult
                },
                endDate: new Date()
            },
            { new: true }
        ).exec().then((doc) => <factory.action.authorize.seatReservation.IAction>(<mongoose.Document>doc).toObject());
        debug('SeatReservation authorize action ended.');

        return action;
    };
}

export function cancelSeatReservationAuthorization(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        const action = await actionRepository.actionModel.findOne({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation
        }).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('actionId', '指定された座席予約は見つかりません');

                }

                return <any>doc.toObject();
            });

        // 座席仮予約削除
        debug('delTmpReserve processing...', action);
        await COA.services.reserve.delTmpReserve({
            theaterCode: action.result.updTmpReserveSeatArgs.theaterCode,
            dateJouei: action.result.updTmpReserveSeatArgs.dateJouei,
            titleCode: action.result.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: action.result.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: action.result.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: action.result.updTmpReserveSeatResult.tmpReserveNum
        });
        debug('delTmpReserve processed');

        await actionRepository.actionModel.findByIdAndUpdate(
            actionId,
            {
                actionStatus: factory.actionStatusType.CanceledActionStatus
            }
        ).exec();
    };
}

/**
 * create a mvtk authorizeAction
 * add the result of using a mvtk card
 * @export
 * @function
 * @param {string} transactionId
 * @param {factory.action.authorize.mvtk.IObject} authorizeActionObject
 * @return ITransactionOperation<factory.action.authorize.mvtk.IAuthorizeAction>
 * @memberof service/transaction/placeOrder
 */
export function createMvtkAuthorization(
    agentId: string,
    transactionId: string,
    authorizeObject: factory.action.authorize.mvtk.IObject
): IActionAndTransactionOperation<factory.action.authorize.mvtk.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 座席予約承認を取得
        const seatReservationAuthorizeAction = <any>await actionRepository.actionModel.findOne({
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation,
            typeOf: factory.actionType.AuthorizeAction,
            actionStatus: factory.actionStatusType.CompletedActionStatus
        }).lean().exec();

        // seatReservationAuthorization already exists?
        if (seatReservationAuthorizeAction === undefined) {
            throw new Error('seat reservation authorizeAction not created yet');
        }

        // knyknrNo matched?
        // interface IKnyknrNoNumsByNo { [knyknrNo: string]: number; }
        // const knyknrNoNumsByNoShouldBe: IKnyknrNoNumsByNo = seatReservationAuthorizeAction.object.acceptedOffers.reduce(
        //     (a: IKnyknrNoNumsByNo, b) => {
        //         const knyknrNo = b.itemOffered.reservedTicket.coaTicketInfo.mvtkNum;
        //         if (a[knyknrNo] === undefined) {
        //             a[knyknrNo] = 0;
        //         }
        //         a[knyknrNo] += 1;

        //         return a;
        //     },
        //     {}
        // );
        // const knyknrNoNumsByNo: IKnyknrNoNumsByNo = authorizeObject.seatInfoSyncIn.knyknrNoInfo.reduce(
        //     (a: IKnyknrNoNumsByNo, b) => {
        //         if (a[b.knyknrNo] === undefined) {
        //             a[b.knyknrNo] = 0;
        //         }
        //         const knyknrNoNum = b.knshInfo.reduce((a2, b2) => a2 + b2.miNum, 0);
        //         a[b.knyknrNo] += knyknrNoNum;

        //         return a;
        //     },
        //     {}
        // );
        // debug('knyknrNoNumsByNo:', knyknrNoNumsByNo);
        // debug('knyyknrNoNumsByNoShouldBe:', knyknrNoNumsByNoShouldBe);
        // const knyknrNoExistsInSeatReservation =
        //     Object.keys(knyknrNoNumsByNo).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        // const knyknrNoExistsMvtkResult =
        //     Object.keys(knyknrNoNumsByNoShouldBe).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        // if (!knyknrNoExistsInSeatReservation || !knyknrNoExistsMvtkResult) {
        //     throw new factory.errors.Argument('authorizeActionResult', 'knyknrNoInfo not matched with seat reservation authorizeAction');
        // }

        // stCd matched? (last two figures of theater code)
        // tslint:disable-next-line:no-magic-numbers
        // const stCdShouldBe = seatReservationAuthorization.object.updTmpReserveSeatArgs.theaterCode.slice(-2);
        // if (authorizeObject.seatInfoSyncIn.stCd !== stCdShouldBe) {
        //     throw new factory.errors.Argument('authorizeActionResult', 'stCd not matched with seat reservation authorizeAction');
        // }

        // skhnCd matched?
        // tslint:disable-next-line:max-line-length
        // const skhnCdShouldBe = `${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleCode}${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleBranchNum}`;
        // if (authorizeObject.seatInfoSyncIn.skhnCd !== skhnCdShouldBe) {
        //     throw new factory.errors.Argument('authorizeActionResult', 'skhnCd not matched with seat reservation authorizeAction');
        // }

        // screen code matched?
        // if (authorizeObject.seatInfoSyncIn.screnCd !== seatReservationAuthorization.object.updTmpReserveSeatArgs.screenCode) {
        //     throw new factory.errors.Argument('authorizeActionResult', 'screnCd not matched with seat reservation authorizeAction');
        // }

        // seat num matched?
        // const seatNumsInSeatReservationAuthorization =
        //     seatReservationAuthorization.result.updTmpReserveSeatResult.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        // if (!authorizeObject.seatInfoSyncIn.zskInfo.every(
        //     (zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0
        // )) {
        //     throw new factory.errors.Argument('authorizeActionResult', 'zskInfo not matched with seat reservation authorizeAction');
        // }

        const action = factory.action.authorize.mvtk.create({
            id: mongoose.Types.ObjectId().toString(),
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            result: {
                price: authorizeObject.price
            },
            object: authorizeObject,
            agent: transaction.seller,
            recipient: transaction.agent,
            startDate: new Date(),
            endDate: new Date()

        });
        await actionRepository.actionModel.create({ ...action, ...{ _id: action.id } });
        // await transactionRepository.pushDiscountInfo(transactionId, authorizeAction);

        return action;
    };
}

export function cancelMvtkAuthorization(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        await actionRepository.actionModel.findOne({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.Mvtk
        }).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('actionId', '指定されたムビチケは見つかりません');

                }

                return <any>doc.toObject();
            });

        await actionRepository.actionModel.findByIdAndUpdate(
            actionId,
            {
                actionStatus: factory.actionStatusType.CanceledActionStatus
            }
        ).exec();
    };
}

/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
// export function addEmail(transactionId: string, notification: EmailNotificationFactory.INotification) {
//     return async (transactionRepository: TransactionRepository) => {
//         // イベント作成
//         const event = AddNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: notification
//         });

//         // 永続化
//         debug('adding an event...', event);
//         await pushEvent(transactionId, event)(transactionRepository);
//     };
// }

/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
// export function removeEmail(transactionId: string, notificationId: string) {
//     return async (transactionRepository: TransactionRepository) => {
//         const transaction = await findInProgressById(transactionId)(transactionRepository)
//             .then((option) => {
//                 if (option.isEmpty) {
//                     throw new factory.errors.Argument('transactionId', `transaction[${transactionId}] not found.`);
//                 }

//                 return option.get();
//             });

//         type ITransactionEvent = AddNotificationTransactionEventFactory.ITransactionEvent<EmailNotificationFactory.INotification>;
//         const addNotificationTransactionEvent = <ITransactionEvent>transaction.object.actionEvents.find(
//             (actionEvent) =>
//                 actionEvent.actionEventType === TransactionEventGroup.AddNotification &&
//                 (<ITransactionEvent>actionEvent).notification.id === notificationId
//         );
//         if (addNotificationTransactionEvent === undefined) {
//             throw new factory.errors.Argument('notificationId', `notification [${notificationId}] not found in the transaction.`);
//         }

//         // イベント作成
//         const event = RemoveNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: addNotificationTransactionEvent.notification
//         });

//         // 永続化
//         await pushEvent(transactionId, event)(transactionRepository);
//     };
// }

/**
 * 取引中の購入者情報を変更する
 */
export function setCustomerContacts(
    agentId: string,
    transactionId: string,
    contact: factory.transaction.placeOrder.ICustomerContact
): ITransactionOperation<void> {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        await transactionRepository.setCustomerContactsOnPlaceOrderInProgress(transactionId, contact);
    };
}

/**
 * 取引確定
 */
export function confirm(
    agentId: string,
    transactionId: string
) {
    // tslint:disable-next-line:max-func-body-length
    return async (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // authorizeActionsを取得
        const authorizeActions = <any[]>await actionRepository.actionModel.find({
            'object.transactionId': transactionId,
            typeOf: factory.actionType.AuthorizeAction,
            actionStatus: factory.actionStatusType.CompletedActionStatus
        }).lean().exec();

        const seatReservationAuthorizeAction = authorizeActions.find((action) => {
            return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.SeatReservation;
        });
        if (seatReservationAuthorizeAction === undefined) {
            return false;
        }

        const creditCardAuthorizeActions = authorizeActions.filter((action) => {
            return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard;
        });
        const mvtkAuthorizeActions = authorizeActions.filter((action) => {
            return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.Mvtk;
        });

        transaction.object.seatReservation = seatReservationAuthorizeAction;
        transaction.object.paymentInfos = creditCardAuthorizeActions;
        transaction.object.discountInfos = mvtkAuthorizeActions;

        // 照会可能になっているかどうか
        if (!canBeClosed(transaction)) {
            throw new factory.errors.Argument('transactionId', 'transaction cannot be closed');
        }

        // 結果作成
        const order = factory.order.createFromPlaceOrderTransaction({
            transaction: transaction
        });
        const ownershipInfos = order.acceptedOffers.map((acceptedOffer) => {
            return factory.ownershipInfo.create({
                ownedBy: {
                    id: transaction.agent.id,
                    typeOf: transaction.agent.typeOf,
                    name: order.customer.name
                },
                acquiredFrom: transaction.seller,
                ownedFrom: new Date(),
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: acceptedOffer.itemOffered
            });
        });
        const result: factory.transaction.placeOrder.IResult = {
            order: order,
            ownershipInfos: ownershipInfos
        };

        // ステータス変更
        debug('updating transaction...');
        await transactionRepository.transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                typeOf: factory.transactionType.PlaceOrder,
                status: factory.transactionStatusType.InProgress
            },
            {
                status: factory.transactionStatusType.Confirmed, // ステータス変更
                endDate: moment().toDate(),
                object: transaction.object, // objectを更新
                result: result // resultを更新
            },
            { new: true }
        ).exec();

        return order;
    };
}

/**
 * whether a transaction can be closed
 * @function
 * @returns {boolean}
 */
function canBeClosed(transaction: factory.transaction.placeOrder.ITransaction) {
    // seatReservation exists?
    const seatReservationAuthorization = transaction.object.seatReservation;
    if (seatReservationAuthorization === undefined) {
        return false;
    }

    const paymentInfos = transaction.object.paymentInfos;
    const discountInfos = transaction.object.discountInfos;

    const priceBySeller = (<factory.action.authorize.seatReservation.IResult>seatReservationAuthorization.result).price;
    const priceByAgent =
        paymentInfos.reduce((a, b) => a + (<factory.action.authorize.creditCard.IResult>b.result).price, 0) +
        discountInfos.reduce((a, b) => a + (<factory.action.authorize.mvtk.IResult>b.result).price, 0);

    // price matched between an agent and a seller?
    return priceByAgent === priceBySeller;
}
