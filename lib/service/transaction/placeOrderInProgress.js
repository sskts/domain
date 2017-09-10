"use strict";
/**
 * placeOrder in progress transaction service
 * 進行中注文取引サービス
 * @namespace service.transaction.placeOrderInProgress
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const mongoose = require("mongoose");
const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');
/**
 * 取引開始
 */
function start(args) {
    return (
        // personRepository: PersonRepository,
        organizationRepository, transactionRepository, transactionCountRepository) => __awaiter(this, void 0, void 0, function* () {
        // 利用可能かどうか
        const nextCount = yield transactionCountRepository.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            throw new factory.errors.NotFound('available transaction');
        }
        const agent = {
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
        const seller = yield organizationRepository.findMovieTheaterById(args.sellerId);
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
                authorizeActions: []
            },
            expires: args.expires,
            startDate: new Date()
        });
        yield transactionRepository.startPlaceOrder(transaction);
        return transaction;
    });
}
exports.start = start;
/**
 * クレジットカードオーソリ取得
 */
// tslint:disable-next-line:max-func-body-length
function createCreditCardAuthorization(agentId, transactionId, orderId, amount, method, creditCard) {
    // tslint:disable-next-line:max-func-body-length
    return (actionRepository, organizationRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // GMOショップ情報取得
        const movieTheater = yield organizationRepository.findMovieTheaterById(transaction.seller.id);
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
            result: {},
            agent: transaction.agent,
            recipient: transaction.seller,
            startDate: new Date()
        });
        yield actionRepository.actionModel.create(Object.assign({}, action, { _id: action.id }));
        // GMOオーソリ取得
        let entryTranArgs;
        let execTranArgs;
        let entryTranResult;
        let execTranResult;
        try {
            entryTranArgs = {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                jobCd: GMO.utils.util.JobCd.Auth,
                amount: amount
            };
            entryTranResult = yield GMO.services.credit.entryTran(entryTranArgs);
            debug('entryTranResult:', entryTranResult);
            execTranArgs = Object.assign({
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                orderId: orderId,
                method: method,
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS
            }, creditCard, {
                seqMode: GMO.utils.util.SeqMode.Physics
            });
            execTranResult = yield GMO.services.credit.execTran(execTranArgs);
            debug('execTranResult:', execTranResult);
        }
        catch (error) {
            console.error('fail at entryTran or execTran', error);
            // tslint:disable-next-line:no-suspicious-comment
            // TODO actionにエラー結果を追加
            if (error.name === 'GMOServiceBadRequestError') {
                // consider E92000001,E92000002
                // GMO流量制限オーバーエラーの場合
                const serviceUnavailableError = error.errors.find((gmoError) => gmoError.info.match(/^E92000001|E92000002$/));
                if (serviceUnavailableError !== undefined) {
                    throw new factory.errors.ServiceUnavailable(serviceUnavailableError.userMessage);
                }
                // オーダーID重複エラーの場合
                const duplicateError = error.errors.find((gmoError) => gmoError.info.match(/^E01040010$/));
                if (duplicateError !== undefined) {
                    throw new factory.errors.AlreadyInUse('action.object', ['orderId'], duplicateError.userMessage);
                }
                // その他のGMOエラーに場合、なんらかのクライアントエラー
                throw new factory.errors.Argument('payment');
            }
            throw new Error(error);
        }
        // アクションを完了
        debug('ending authorize action...');
        action = yield actionRepository.actionModel.findByIdAndUpdate(action.id, {
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            result: {
                price: amount,
                entryTranArgs: entryTranArgs,
                execTranArgs: execTranArgs,
                execTranResult: execTranResult
            },
            endDate: new Date()
        }, { new: true }).exec().then((doc) => doc.toObject());
        debug('GMO authorize action ended.');
        return action;
    });
}
exports.createCreditCardAuthorization = createCreditCardAuthorization;
function cancelGMOAuthorization(agentId, transactionId, actionId) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const action = yield actionRepository.actionModel.findOne({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.CreditCard
        }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('actionId', '指定されたオーソリは見つかりません');
            }
            return doc.toObject();
        });
        // 決済取消
        yield GMO.services.credit.alterTran({
            shopId: action.result.entryTranArgs.shopId,
            shopPass: action.result.entryTranArgs.shopPass,
            accessId: action.result.execTranArgs.accessId,
            accessPass: action.result.execTranArgs.accessPass,
            jobCd: GMO.utils.util.JobCd.Void
        });
        debug('alterTran processed', GMO.utils.util.JobCd.Void);
        // tslint:disable-next-line:no-suspicious-comment
        // TODO GMO混雑エラーを判別
        yield actionRepository.actionModel.findByIdAndUpdate(actionId, {
            actionStatus: factory.actionStatusType.CanceledActionStatus
        }).exec();
    });
}
exports.cancelGMOAuthorization = cancelGMOAuthorization;
function createSeatReservationAuthorization(agentId, transactionId, individualScreeningEvent, offers) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        let action = factory.action.authorize.seatReservation.create({
            id: mongoose.Types.ObjectId().toString(),
            object: {
                transactionId: transactionId,
                offers: offers,
                individualScreeningEvent: individualScreeningEvent
            },
            agent: transaction.seller,
            recipient: transaction.agent,
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            startDate: new Date()
        });
        yield actionRepository.actionModel.create(Object.assign({}, action, { _id: action.id }));
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
        const updTmpReserveSeatResult = yield COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
        debug('updTmpReserveSeat processed', updTmpReserveSeatResult);
        // COAオーソリ追加
        // アクションを完了
        debug('ending authorize action...');
        const price = offers.reduce((a, b) => a + b.ticketInfo.salePrice + b.ticketInfo.mvtkSalesPrice, 0);
        action = yield actionRepository.actionModel.findByIdAndUpdate(action.id, {
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            result: {
                price: price,
                updTmpReserveSeatArgs: updTmpReserveSeatArgs,
                updTmpReserveSeatResult: updTmpReserveSeatResult
            },
            endDate: new Date()
        }, { new: true }).exec().then((doc) => doc.toObject());
        debug('SeatReservation authorize action ended.');
        return action;
    });
}
exports.createSeatReservationAuthorization = createSeatReservationAuthorization;
function cancelSeatReservationAuthorization(agentId, transactionId, actionId) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const action = yield actionRepository.actionModel.findOne({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation
        }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('actionId', '指定された座席予約は見つかりません');
            }
            return doc.toObject();
        });
        // 座席仮予約削除
        debug('delTmpReserve processing...', action);
        yield COA.services.reserve.delTmpReserve({
            theaterCode: action.result.updTmpReserveSeatArgs.theaterCode,
            dateJouei: action.result.updTmpReserveSeatArgs.dateJouei,
            titleCode: action.result.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: action.result.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: action.result.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: action.result.updTmpReserveSeatResult.tmpReserveNum
        });
        debug('delTmpReserve processed');
        yield actionRepository.actionModel.findByIdAndUpdate(actionId, {
            actionStatus: factory.actionStatusType.CanceledActionStatus
        }).exec();
    });
}
exports.cancelSeatReservationAuthorization = cancelSeatReservationAuthorization;
/**
 * create a mvtk authorizeAction
 * add the result of using a mvtk card
 * @export
 * @function
 * @param {string} transactionId
 * @param {factory.action.authorize.mvtk.IObject} authorizeActionObject
 * @return ITransactionOperation<factory.action.authorize.mvtk.IAuthorizeAction>
 * @memberof service.transaction.placeOrderInProgress
 */
function createMvtkAuthorization(agentId, transactionId, authorizeObject) {
    // tslint:disable-next-line:max-func-body-length
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // 座席予約承認を取得
        const seatReservationAuthorizeAction = yield actionRepository.actionModel.findOne({
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
        yield actionRepository.actionModel.create(Object.assign({}, action, { _id: action.id }));
        // await transactionRepository.pushDiscountInfo(transactionId, authorizeAction);
        return action;
    });
}
exports.createMvtkAuthorization = createMvtkAuthorization;
function cancelMvtkAuthorization(agentId, transactionId, actionId) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        yield actionRepository.actionModel.findOne({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.Mvtk
        }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('actionId', '指定されたムビチケは見つかりません');
            }
            return doc.toObject();
        });
        yield actionRepository.actionModel.findByIdAndUpdate(actionId, {
            actionStatus: factory.actionStatusType.CanceledActionStatus
        }).exec();
    });
}
exports.cancelMvtkAuthorization = cancelMvtkAuthorization;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service.transaction.placeOrderInProgress
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
 * @memberof service.transaction.placeOrderInProgress
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
function setCustomerContacts(agentId, transactionId, contact) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        yield transactionRepository.setCustomerContactsOnPlaceOrderInProgress(transactionId, contact);
    });
}
exports.setCustomerContacts = setCustomerContacts;
/**
 * 取引確定
 */
function confirm(agentId, transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // authorizeActionsを取得
        const authorizeActions = yield actionRepository.actionModel.find({
            'object.transactionId': transactionId,
            typeOf: factory.actionType.AuthorizeAction,
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            endDate: { $lt: now } // 万が一このプロセス中に他処理が発生しても無視するように
        }).exec().then((docs) => docs.map((doc) => doc.toObject()));
        transaction.object.authorizeActions = authorizeActions;
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
                ownedFrom: now,
                // tslint:disable-next-line:no-suspicious-comment
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: acceptedOffer.itemOffered
            });
        });
        const result = {
            order: order,
            ownershipInfos: ownershipInfos
        };
        // ステータス変更
        debug('updating transaction...');
        yield transactionRepository.transactionModel.findOneAndUpdate({
            _id: transactionId,
            typeOf: factory.transactionType.PlaceOrder,
            status: factory.transactionStatusType.InProgress
        }, {
            status: factory.transactionStatusType.Confirmed,
            endDate: now,
            'object.authorizeActions': authorizeActions,
            result: result // resultを更新
        }, { new: true }).exec();
        return order;
    });
}
exports.confirm = confirm;
/**
 * whether a transaction can be closed
 * @function
 * @returns {boolean}
 */
function canBeClosed(transaction) {
    // seatReservation exists?
    const seatReservationAuthorizeAction = transaction.object.authorizeActions.find((action) => {
        return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.SeatReservation;
    });
    if (seatReservationAuthorizeAction === undefined) {
        return false;
    }
    const creditCardAuthorizeActions = transaction.object.authorizeActions.filter((action) => {
        return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard;
    });
    const mvtkAuthorizeActions = transaction.object.authorizeActions.filter((action) => {
        return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.Mvtk;
    });
    const priceBySeller = seatReservationAuthorizeAction.result.price;
    const priceByAgent = creditCardAuthorizeActions.reduce((a, b) => a + b.result.price, 0) +
        mvtkAuthorizeActions.reduce((a, b) => a + b.result.price, 0);
    // price matched between an agent and a seller?
    return priceByAgent === priceBySeller;
}
