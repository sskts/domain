/**
 * 取引サービス
 *
 * @namespace service/transaction/placeOrder
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';

import ArgumentError from '../../error/argument';

import OrganizationAdapter from '../../adapter/organization';
import TaskAdapter from '../../adapter/task';
import TransactionAdapter from '../../adapter/transaction';
import TransactionCountAdapter from '../../adapter/transactionCount';

const debug = createDebug('sskts-domain:service:transaction:placeOrder');

export type ITransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;
export type ITaskAndTransactionOperation<T> = (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export type IOrganizationAndTransactionOperation<T> = (
    organizationAdapter: OrganizationAdapter,
    transactionAdapter: TransactionAdapter
) => Promise<T>;
export type IOrganizationAndTransactionAndTransactionCountOperation<T> = (
    organizationAdapter: OrganizationAdapter,
    transactionAdapter: TransactionAdapter,
    transactionCountAdapter: TransactionCountAdapter
) => Promise<T>;

/**
 * 取引開始
 */
export function start(args: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: factory.clientUser.IClientUser;
    scope: factory.transactionScope.ITransactionScope;
    agentId?: string;
    sellerId: string;
}): IOrganizationAndTransactionAndTransactionCountOperation<monapt.Option<factory.transaction.placeOrder.ITransaction>> {
    return async (
        // personAdapter: PersonAdapter,
        organizationAdapter: OrganizationAdapter,
        transactionAdapter: TransactionAdapter,
        transactionCountAdapter: TransactionCountAdapter
    ) => {
        // 利用可能かどうか
        const nextCount = await transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }

        // 利用可能であれば、取引作成&匿名所有者作成
        let agent: factory.transaction.placeOrder.IAgent;
        if (args.agentId !== undefined) {
            agent = {
                typeOf: 'Person',
                id: args.agentId,
                memberOf: {
                    membershipNumber: args.agentId,
                    programName: 'Amazon Cognito'
                },
                url: ''
            };
        } else {
            agent = {
                typeOf: 'Person',
                id: '',
                url: ''
            };
        }

        // 売り手を取得
        const sellerDoc = await organizationAdapter.organizationModel.findById(args.sellerId).exec();
        if (sellerDoc === null) {
            throw new Error('seller not found');
        }
        const seller = <factory.organization.movieTheater.IOrganization>sellerDoc.toObject();

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = factory.transaction.placeOrder.create({
            status: factory.transactionStatusType.InProgress,
            agent: agent,
            seller: {
                typeOf: 'MovieTheater', // todo enum管理
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

        debug('creating transaction...', transaction);
        // mongoDBに追加するために_id属性を拡張
        await transactionAdapter.transactionModel.create({ ...transaction, ...{ _id: transaction.id } });

        return monapt.Option(transaction);
    };
}

/**
 * 取引を期限切れにする
 */
export function makeExpired() {
    return async (transactionAdapter: TransactionAdapter) => {
        const endDate = moment().toDate();

        // ステータスと期限を見て更新
        await transactionAdapter.transactionModel.update(
            {
                status: factory.transactionStatusType.InProgress,
                expires: { $lt: endDate }
            },
            {
                status: factory.transactionStatusType.Expired,
                endDate: endDate
            },
            { multi: true }
        ).exec();
    };
}

/**
 * ひとつの取引のタスクをエクスポートする
 */
export function exportTasks(status: factory.transactionStatusType) {
    return async (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => {
        const statusesTasksExportable = [factory.transactionStatusType.Expired, factory.transactionStatusType.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new ArgumentError('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }

        const transaction = await transactionAdapter.transactionModel.findOneAndUpdate(
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
            taskAdapter,
            transactionAdapter
        );

        await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id,
            {
                tasksExportationStatus: factory.transactionTasksExportationStatus.Exported,
                tasksExportedAt: moment().toDate(),
                tasks: tasks
            }
        ).exec();
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => {
        const transaction = await transactionAdapter.transactionModel.findById(transactionId).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error(`trade[${transactionId}] not found.`);
                }

                return <factory.transaction.placeOrder.ITransaction>doc.toObject();
            });

        const tasks: factory.task.ITask[] = [];
        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                tasks.push(factory.task.settleSeatReservation.create({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(factory.task.settleGMO.create({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(factory.task.settleMvtk.create({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(factory.task.createOrder.create({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
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
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(factory.task.cancelGMO.create({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(factory.task.cancelMvtk.create({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));

                break;

            default:
                throw new ArgumentError('id', 'transaction group not implemented.');
        }
        debug('tasks prepared', tasks);

        await Promise.all(tasks.map(async (task) => {
            debug('storing task...', task);
            await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        }));

        return tasks;
    };
}

/**
 * タスクエクスポートリトライ
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export function reexportTasks(intervalInMinutes: number) {
    return async (transactionAdapter: TransactionAdapter) => {
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting,
                updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
            },
            {
                tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
            }
        ).exec();
    };
}

/**
 * 進行中の取引を取得する
 */
export function findInProgressById(
    transactionId: string
): ITransactionOperation<monapt.Option<factory.transaction.placeOrder.ITransaction>> {
    return async (transactionAdapter: TransactionAdapter) => {
        return await transactionAdapter.transactionModel.findOne({
            _id: transactionId,
            typeOf: factory.transactionType.PlaceOrder,
            status: factory.transactionStatusType.InProgress
        }).exec()
            .then((doc) => {
                return (doc === null) ? monapt.None : monapt.Option(<factory.transaction.placeOrder.ITransaction>doc.toObject());
            });
    };
}

/**
 * 生のクレジットカード情報
 */
export interface ICreditCard4authorizationRaw {
    cardNo: string;
    expire: string;
    securityCode: string;
}
/**
 * トークン化されたクレジットカード情報
 */
export interface ICreditCard4authorizationTokenized {
    token: string;
}
/**
 * 会員のクレジットカード情報
 */
export interface ICreditCard4authorizationOfMember {
    memberId: string;
    cardSeq: number;
    cardPass?: string;
}
/**
 * オーソリを取得するクレジットカード情報インターフェース
 */
export type ICreditCard4authorization =
    ICreditCard4authorizationRaw | ICreditCard4authorizationTokenized | ICreditCard4authorizationOfMember;
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
    return async (organizationAdapter: OrganizationAdapter, transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

        // GMOショップ情報取得
        const movieTheater = await organizationAdapter.organizationModel.findById(transaction.seller.id).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error('movieTheater not found');
                }

                return <factory.organization.movieTheater.IOrganization>doc.toObject();
            });

        // GMOオーソリ取得
        const entryTranResult = await GMO.services.credit.entryTran({
            shopId: movieTheater.gmoInfo.shopId,
            shopPass: movieTheater.gmoInfo.shopPass,
            orderId: orderId,
            jobCd: GMO.utils.util.JobCd.Auth,
            amount: amount
        });
        const execTranArgs = {
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
        const execTranResult = await GMO.services.credit.execTran(execTranArgs);
        debug(execTranResult);

        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        const gmoAuthorization = factory.authorization.gmo.create({
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

        await transactionAdapter.transactionModel.findByIdAndUpdate(
            transactionId,
            { $push: { 'object.paymentInfos': gmoAuthorization } }
        ).exec();
        debug('GMOAuthorization added.');

        return gmoAuthorization;
    };
}

export function cancelGMOAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

        const authorization = transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.group === factory.authorizationGroup.GMO
        );
        if (authorization === undefined) {
            throw new ArgumentError('authorizationId', '指定されたオーソリは見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new ArgumentError('authorizationId', '指定されたオーソリは見つかりません');
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

        await transactionAdapter.transactionModel.findByIdAndUpdate(
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
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

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
            price: offers.reduce((a, b) => a + b.ticketInfo.salePrice + b.ticketInfo.mvtkSalesPrice, 0),
            updTmpReserveSeatArgs: updTmpReserveSeatArgs,
            reserveSeatsTemporarilyResult: reserveSeatsTemporarilyResult,
            tickets: offers.map((offer) => offer.ticketInfo),
            individualScreeningEvent: individualScreeningEvent
        });

        await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id,
            { 'object.seatReservation': authorization }
        ).exec();
        debug('coaAuthorization added.');

        return authorization;
    };
}

export function cancelSeatReservationAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

        const authorization = transaction.object.seatReservation;
        if (authorization === undefined) {
            throw new ArgumentError('authorizationId', '指定された座席予約は見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new ArgumentError('authorizationId', '指定された座席予約は見つかりません');
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

        await transactionAdapter.transactionModel.findByIdAndUpdate(
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
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

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
            throw new ArgumentError('authorizationResult', 'knyknrNoInfo not matched with seat reservation authorization');
        }

        // stCd matched? (last two figures of theater code)
        // tslint:disable-next-line:no-magic-numbers
        const stCdShouldBe = seatReservationAuthorization.object.updTmpReserveSeatArgs.theaterCode.slice(-2);
        if (authorizationResult.stCd !== stCdShouldBe) {
            throw new ArgumentError('authorizationResult', 'stCd not matched with seat reservation authorization');
        }

        // skhnCd matched?
        // tslint:disable-next-line:max-line-length
        const skhnCdShouldBe = `${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleCode}${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleBranchNum}`;
        if (authorizationResult.skhnCd !== skhnCdShouldBe) {
            throw new ArgumentError('authorizationResult', 'skhnCd not matched with seat reservation authorization');
        }

        // screen code matched?
        if (authorizationResult.screnCd !== seatReservationAuthorization.object.updTmpReserveSeatArgs.screenCode) {
            throw new ArgumentError('authorizationResult', 'screnCd not matched with seat reservation authorization');
        }

        // seat num matched?
        const seatNumsInSeatReservationAuthorization =
            seatReservationAuthorization.result.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        if (!authorizationResult.zskInfo.every((zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0)) {
            throw new ArgumentError('authorizationResult', 'zskInfo not matched with seat reservation authorization');
        }

        const authorization = factory.authorization.mvtk.create({
            price: authorizationResult.price,
            result: authorizationResult,
            object: {}
        });

        await transactionAdapter.transactionModel.findByIdAndUpdate(
            transactionId,
            { $push: { 'object.discountInfos': authorization } }
        ).exec();

        return authorization;
    };
}

export function cancelMvtkAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

        const authorization = transaction.object.discountInfos.find(
            (discountInfo) => discountInfo.group === factory.authorizationGroup.MVTK
        );
        if (authorization === undefined) {
            throw new ArgumentError('authorizationId', 'mvtk authorization not found');
        }
        if (authorization.id !== authorizationId) {
            throw new ArgumentError('authorizationId', 'mvtk authorization not found');
        }

        await transactionAdapter.transactionModel.findByIdAndUpdate(
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
//     return async (transactionAdapter: TransactionAdapter) => {
//         // イベント作成
//         const event = AddNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: notification
//         });

//         // 永続化
//         debug('adding an event...', event);
//         await pushEvent(transactionId, event)(transactionAdapter);
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
//     return async (transactionAdapter: TransactionAdapter) => {
//         const transaction = await findInProgressById(transactionId)(transactionAdapter)
//             .then((option) => {
//                 if (option.isEmpty) {
//                     throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
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
//             throw new ArgumentError('notificationId', `notification [${notificationId}] not found in the transaction.`);
//         }

//         // イベント作成
//         const event = RemoveNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: addNotificationTransactionEvent.notification
//         });

//         // 永続化
//         await pushEvent(transactionId, event)(transactionAdapter);
//     };
// }

/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 */
export function setAgentProfile(
    transactionId: string,
    profile: factory.transaction.placeOrder.ICustomerContact
) {
    return async (transactionAdapter: TransactionAdapter) => {
        await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

        // 永続化
        debug('setting person profile...');
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                status: factory.transactionStatusType.InProgress
            },
            {
                'object.customerContact': profile
            }
        ).exec();
    };
}

/**
 * 取引確定
 */
export function confirm(transactionId: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

        // 照会可能になっているかどうか
        const seatReservationAuthorization = transaction.object.seatReservation;
        if (seatReservationAuthorization === undefined) {
            throw new ArgumentError('transactionId', '座席予約が見つかりません');
        }

        if (transaction.object.customerContact === undefined) {
            throw new ArgumentError('transactionId', '購入者情報が見つかりません');
        }

        const cutomerContact = transaction.object.customerContact;
        const orderInquiryKey = {
            theaterCode: seatReservationAuthorization.object.updTmpReserveSeatArgs.theaterCode,
            orderNumber: seatReservationAuthorization.result.tmpReserveNum,
            telephone: cutomerContact.telephone
        };

        // 条件が対等かどうかチェック
        if (!canBeClosed(transaction)) {
            throw new Error('transaction cannot be closed');
        }

        // 結果作成
        const discounts: factory.order.IDiscount[] = [];
        transaction.object.discountInfos.forEach((discountInfo) => {
            switch (discountInfo.group) {
                case factory.authorizationGroup.MVTK:
                    const discountCode = (<factory.authorization.mvtk.IAuthorization>discountInfo).result.knyknrNoInfo.map(
                        (knshInfo) => knshInfo.knyknrNo
                    ).join(',');

                    discounts.push({
                        name: 'ムビチケカード',
                        discount: discountInfo.price,
                        discountCode: discountCode,
                        discountCurrency: factory.priceCurrency.JPY
                    });
                    break;
                default:
                    break;
            }
        });

        const paymentMethods: factory.order.IPaymentMethod[] = [];
        transaction.object.paymentInfos.forEach((paymentInfo) => {
            switch (paymentInfo.group) {
                case factory.authorizationGroup.GMO:
                    const paymentMethodId = (<factory.authorization.gmo.IAuthorization>paymentInfo).result.orderId;

                    paymentMethods.push({
                        name: 'クレジットカード',
                        paymentMethod: 'CreditCard',
                        paymentMethodId: paymentMethodId
                    });
                    break;
                default:
                    break;
            }
        });

        const order = factory.order.createFromBuyTransaction({
            seatReservationAuthorization: seatReservationAuthorization,
            customerName: `${cutomerContact.familyName} ${cutomerContact.givenName}`,
            seller: {
                name: transaction.seller.name,
                url: ''
            },
            orderNumber: `${orderInquiryKey.theaterCode}-${orderInquiryKey.orderNumber}`,
            orderInquiryKey: orderInquiryKey,
            // tslint:disable-next-line:no-suspicious-comment
            // TODO ムビチケ対応
            paymentMethods: paymentMethods,
            discounts: discounts
        });
        const ownershipInfos = order.acceptedOffers.map((reservation) => {
            return factory.ownershipInfo.create({
                ownedBy: {
                    id: transaction.agent.id,
                    typeOf: transaction.agent.typeOf,
                    name: `${cutomerContact.familyName} ${cutomerContact.givenName}`
                },
                acquiredFrom: transaction.seller,
                ownedFrom: new Date(),
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: reservation
            });
        });
        const result: factory.transaction.placeOrder.IResult = {
            order: order,
            ownershipInfos: ownershipInfos
        };

        // ステータス変更
        debug('updating transaction...');
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                status: factory.transactionStatusType.InProgress
            },
            {
                status: factory.transactionStatusType.Confirmed,
                endDate: moment().toDate(),
                result: result
            },
            { new: true }
        ).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error('進行中の購入アクションはありません');
                }
            });

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
