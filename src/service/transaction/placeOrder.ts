/**
 * placeOrder transaction service
 * 注文取引サービス
 * @namespace service/transaction/placeOrder
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import OrganizationRepository from '../../repo/organization';
import TaskRepository from '../../repo/task';
import TransactionRepository from '../../repo/transaction';
import TransactionCountRepository from '../../repo/transactionCount';

const debug = createDebug('sskts-domain:service:transaction:placeOrder');

export type ITransactionOperation<T> = (transactionRepository: TransactionRepository) => Promise<T>;
export type ITaskAndTransactionOperation<T> = (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => Promise<T>;
export type IOrganizationAndTransactionOperation<T> = (
    organizationRepository: OrganizationRepository,
    transactionRepository: TransactionRepository
) => Promise<T>;
export type IOrganizationAndTransactionAndTransactionCountOperation<T> = (
    organizationRepository: OrganizationRepository,
    transactionRepository: TransactionRepository,
    transactionCountRepository: TransactionCountRepository
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
 * ひとつの取引のタスクをエクスポートする
 */
export function exportTasks(status: factory.transactionStatusType) {
    return async (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => {
        const statusesTasksExportable = [factory.transactionStatusType.Expired, factory.transactionStatusType.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new factory.errors.Argument('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }

        const transaction = await transactionRepository.transactionModel.findOneAndUpdate(
            {
                status: status,
                tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
            },
            { tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting },
            { new: true }
        ).exec()
            .then((doc) => (doc === null) ? null : <factory.transaction.placeOrder.ITransaction>doc.toObject());

        if (transaction === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = await exportTasksById(transaction.id)(
            taskRepository,
            transactionRepository
        );

        await transactionRepository.setTasksExportedById(transaction.id, tasks);
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);

        const tasks: factory.task.ITask[] = [];
        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                tasks.push(factory.task.settleSeatReservation.create({
                    id: mongoose.Types.ObjectId().toString(),
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                tasks.push(factory.task.settleGMO.create({
                    id: mongoose.Types.ObjectId().toString(),
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                tasks.push(factory.task.settleMvtk.create({
                    id: mongoose.Types.ObjectId().toString(),
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                tasks.push(factory.task.createOrder.create({
                    id: mongoose.Types.ObjectId().toString(),
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));

                // notifications.forEach((notification) => {
                //     if (notification.group === NotificationGroup.EMAIL) {
                //         tasks.push(SendEmailNotificationTaskFactory.create({
                //             status: factory.taskStatus.Ready,
                //             runsAt: new Date(), // todo emailのsent_atを指定
                //             remainingNumberOfTries: 10,
                //             lastTriedAt: null,
                //             numberOfTried: 0,
                //             executionResults: [],
                //             data: {
                //                 notification: <EmailNotificationFactory.INotification>notification
                //             }
                //         }));
                //     }
                // });

                break;

            // 期限切れの場合は、タスクリストを作成する
            case factory.transactionStatusType.Expired:
                tasks.push(factory.task.cancelSeatReservation.create({
                    id: mongoose.Types.ObjectId().toString(),
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                tasks.push(factory.task.cancelGMO.create({
                    id: mongoose.Types.ObjectId().toString(),
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                tasks.push(factory.task.cancelMvtk.create({
                    id: mongoose.Types.ObjectId().toString(),
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));

                break;

            default:
                throw new factory.errors.Argument('id', 'transaction group not implemented.');
        }
        debug('tasks prepared', tasks);

        await Promise.all(tasks.map(async (task) => {
            debug('storing task...', task);
            await taskRepository.save(task);
        }));

        return tasks;
    };
}

/**
 * オーソリを取得するクレジットカード情報インターフェース
 */
export type ICreditCard4authorization =
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardRaw |
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized |
    factory.paymentMethod.paymentCard.creditCard.IUnauthorizedCardOfMember;

/**
 * クレジットカードオーソリ取得
 */
export function createCreditCardAuthorization(
    transactionId: string,
    orderId: string,
    amount: number,
    method: GMO.utils.util.Method,
    creditCard: ICreditCard4authorization
): IOrganizationAndTransactionOperation<factory.authorization.gmo.IAuthorization> {
    return async (organizationRepository: OrganizationRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        // GMOショップ情報取得
        const movieTheater = await organizationRepository.findMovieTheaterById(transaction.seller.id);

        // GMOオーソリ取得
        let entryTranResult: GMO.services.credit.IEntryTranResult;
        let execTranResult: GMO.services.credit.IExecTranResult;
        try {
            entryTranResult = await GMO.services.credit.entryTran({
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                jobCd: GMO.utils.util.JobCd.Auth,
                amount: amount
            });
            debug('entryTranResult:', entryTranResult);

            execTranResult = await GMO.services.credit.execTran({
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
            });
            debug('execTranResult:', execTranResult);
        } catch (error) {
            console.error('fail at entryTran or execTran', error);
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

        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        const gmoAuthorization = factory.authorization.gmo.create({
            id: mongoose.Types.ObjectId().toString(),
            price: amount,
            object: {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                amount: amount,
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                jobCd: GMO.utils.util.JobCd.Auth,
                payType: GMO.utils.util.PayType.Credit
            },
            result: execTranResult
        });

        await transactionRepository.transactionModel.findByIdAndUpdate(
            transactionId,
            { $push: { 'object.paymentInfos': gmoAuthorization } }
        ).exec();
        debug('GMOAuthorization added.');

        return gmoAuthorization;
    };
}

export function cancelGMOAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        const authorization = transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.group === factory.authorizationGroup.GMO
        );
        if (authorization === undefined) {
            throw new factory.errors.Argument('authorizationId', '指定されたオーソリは見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new factory.errors.Argument('authorizationId', '指定されたオーソリは見つかりません');
        }

        // 決済取消
        await GMO.services.credit.alterTran({
            shopId: authorization.object.shopId,
            shopPass: authorization.object.shopPass,
            accessId: authorization.object.accessId,
            accessPass: authorization.object.accessPass,
            jobCd: GMO.utils.util.JobCd.Void
        });
        debug('alterTran processed', GMO.utils.util.JobCd.Void);

        await transactionRepository.transactionModel.findByIdAndUpdate(
            transaction.id,
            {
                $pull: { 'object.paymentInfos': { id: authorizationId } }
            }
        ).exec();
    };
}

export function createSeatReservationAuthorization(
    transactionId: string,
    individualScreeningEvent: factory.event.individualScreeningEvent.IEvent,
    offers: factory.offer.ISeatReservationOffer[]
): ITransactionOperation<factory.authorization.seatReservation.IAuthorization> {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

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
        const reserveSeatsTemporarilyResult = await COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
        debug('updTmpReserveSeat processed', reserveSeatsTemporarilyResult);

        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const authorization = factory.authorization.seatReservation.createFromCOATmpReserve({
            updTmpReserveSeatArgs: updTmpReserveSeatArgs,
            reserveSeatsTemporarilyResult: reserveSeatsTemporarilyResult,
            offers: offers,
            individualScreeningEvent: individualScreeningEvent
        });

        await transactionRepository.transactionModel.findByIdAndUpdate(
            transaction.id,
            { 'object.seatReservation': authorization }
        ).exec();
        debug('coaAuthorization added.');

        return authorization;
    };
}

export function cancelSeatReservationAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        const authorization = transaction.object.seatReservation;
        if (authorization === undefined) {
            throw new factory.errors.Argument('authorizationId', '指定された座席予約は見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new factory.errors.Argument('authorizationId', '指定された座席予約は見つかりません');
        }

        // 座席仮予約削除
        debug('delTmpReserve processing...', authorization);
        await COA.services.reserve.delTmpReserve({
            theaterCode: authorization.object.updTmpReserveSeatArgs.theaterCode,
            dateJouei: authorization.object.updTmpReserveSeatArgs.dateJouei,
            titleCode: authorization.object.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: authorization.object.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: authorization.object.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: authorization.result.tmpReserveNum
        });
        debug('delTmpReserve processed');

        await transactionRepository.transactionModel.findByIdAndUpdate(
            transaction.id,
            {
                $unset: { 'object.seatReservation': 1 }
            }
        ).exec();
    };
}

/**
 * create a mvtk authorization
 * add the result of using a mvtk card
 * @export
 * @function
 * @param {string} transactionId
 * @param {factory.authorization.mvtk.IResult} authorizationResult
 * @return {ITransactionOperation<factory.authorization.mvtk.IAuthorization>}
 * @memberof service/transaction/placeOrder
 */
export function createMvtkAuthorization(
    transactionId: string,
    authorizationResult: factory.authorization.mvtk.IResult
): ITransactionOperation<factory.authorization.mvtk.IAuthorization> {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        const seatReservationAuthorization = transaction.object.seatReservation;
        // seatReservationAuthorization already exists?
        if (seatReservationAuthorization === undefined) {
            throw new Error('seat reservation authorization not created yet');
        }

        // knyknrNo matched?
        interface IKnyknrNoNumsByNo { [knyknrNo: string]: number; }
        const knyknrNoNumsByNoShouldBe: IKnyknrNoNumsByNo = seatReservationAuthorization.object.acceptedOffers.reduce(
            (a: IKnyknrNoNumsByNo, b) => {
                const knyknrNo = b.itemOffered.reservedTicket.coaTicketInfo.mvtkNum;
                if (a[knyknrNo] === undefined) {
                    a[knyknrNo] = 0;
                }
                a[knyknrNo] += 1;

                return a;
            },
            {}
        );
        const knyknrNoNumsByNo: IKnyknrNoNumsByNo = authorizationResult.knyknrNoInfo.reduce(
            (a: IKnyknrNoNumsByNo, b) => {
                if (a[b.knyknrNo] === undefined) {
                    a[b.knyknrNo] = 0;
                }
                const knyknrNoNum = b.knshInfo.reduce((a2, b2) => a2 + b2.miNum, 0);
                a[b.knyknrNo] += knyknrNoNum;

                return a;
            },
            {}
        );
        debug('knyknrNoNumsByNo:', knyknrNoNumsByNo);
        debug('knyyknrNoNumsByNoShouldBe:', knyknrNoNumsByNoShouldBe);
        const knyknrNoExistsInSeatReservation =
            Object.keys(knyknrNoNumsByNo).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        const knyknrNoExistsMvtkResult =
            Object.keys(knyknrNoNumsByNoShouldBe).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        if (!knyknrNoExistsInSeatReservation || !knyknrNoExistsMvtkResult) {
            throw new factory.errors.Argument('authorizationResult', 'knyknrNoInfo not matched with seat reservation authorization');
        }

        // stCd matched? (last two figures of theater code)
        // tslint:disable-next-line:no-magic-numbers
        const stCdShouldBe = seatReservationAuthorization.object.updTmpReserveSeatArgs.theaterCode.slice(-2);
        if (authorizationResult.stCd !== stCdShouldBe) {
            throw new factory.errors.Argument('authorizationResult', 'stCd not matched with seat reservation authorization');
        }

        // skhnCd matched?
        // tslint:disable-next-line:max-line-length
        const skhnCdShouldBe = `${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleCode}${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleBranchNum}`;
        if (authorizationResult.skhnCd !== skhnCdShouldBe) {
            throw new factory.errors.Argument('authorizationResult', 'skhnCd not matched with seat reservation authorization');
        }

        // screen code matched?
        if (authorizationResult.screnCd !== seatReservationAuthorization.object.updTmpReserveSeatArgs.screenCode) {
            throw new factory.errors.Argument('authorizationResult', 'screnCd not matched with seat reservation authorization');
        }

        // seat num matched?
        const seatNumsInSeatReservationAuthorization =
            seatReservationAuthorization.result.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        if (!authorizationResult.zskInfo.every((zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0)) {
            throw new factory.errors.Argument('authorizationResult', 'zskInfo not matched with seat reservation authorization');
        }

        const authorization = factory.authorization.mvtk.create({
            id: mongoose.Types.ObjectId().toString(),
            price: authorizationResult.price,
            result: authorizationResult,
            object: {}
        });

        await transactionRepository.transactionModel.findByIdAndUpdate(
            transactionId,
            { $push: { 'object.discountInfos': authorization } }
        ).exec();

        return authorization;
    };
}

export function cancelMvtkAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        const authorization = transaction.object.discountInfos.find(
            (discountInfo) => discountInfo.group === factory.authorizationGroup.MVTK
        );
        if (authorization === undefined) {
            throw new factory.errors.Argument('authorizationId', 'mvtk authorization not found');
        }
        if (authorization.id !== authorizationId) {
            throw new factory.errors.Argument('authorizationId', 'mvtk authorization not found');
        }

        await transactionRepository.transactionModel.findByIdAndUpdate(
            transaction.id,
            {
                $pull: { 'object.discountInfos': { id: authorizationId } }
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
 * 取引確定
 */
export function confirm(transactionId: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderInProgressById(transactionId);

        // 照会可能になっているかどうか
        if (!canBeClosed(transaction)) {
            throw new Error('transaction cannot be closed');
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
        await transactionRepository.confirmPlaceOrder(transaction.id, result);

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

    const priceBySeller = seatReservationAuthorization.price;
    const priceByAgent = paymentInfos.reduce((a, b) => a + b.price, 0) + discountInfos.reduce((a, b) => a + b.price, 0);

    // price matched between an agent and a seller?
    return priceByAgent === priceBySeller;
}
