/**
 * 取引サービス
 *
 * @namespace service/transaction/placeOrder
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';

import ArgumentError from '../../error/argument';

import * as GMOAuthorizationFactory from '../../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../../factory/authorization/mvtk';
import * as SeatReservationAuthorizationFactory from '../../factory/authorization/seatReservation';
import AuthorizationGroup from '../../factory/authorizationGroup';
import * as clientUserFactory from '../../factory/clientUser';
import * as IndividualScreeningEventFactory from '../../factory/event/individualScreeningEvent';
import * as OrderFactory from '../../factory/order';
import * as OrderInquiryKeyFactory from '../../factory/orderInquiryKey';
import * as OrganizationFactory from '../../factory/organization';
import * as MovieTheaterOrganizationFactory from '../../factory/organization/movieTheater';
import * as OwnershipInfoFactory from '../../factory/ownershipInfo';
import * as PersonFactory from '../../factory/person';
import * as TaskFactory from '../../factory/task';
import * as CancelGMOTaskFactory from '../../factory/task/cancelGMO';
import * as CancelMvtkTaskFactory from '../../factory/task/cancelMvtk';
import * as CancelSeatReservationTaskFactory from '../../factory/task/cancelSeatReservation';
import * as CreateOrderTaskFactory from '../../factory/task/createOrder';
import * as SettleGMOTaskFactoryTaskFactory from '../../factory/task/settleGMO';
import * as SettleMvtkTaskFactory from '../../factory/task/settleMvtk';
import * as SettleSeatReservationTaskFactory from '../../factory/task/settleSeatReservation';
import TaskStatus from '../../factory/taskStatus';
import * as PlaceOrderTransactionFactory from '../../factory/transaction/placeOrder';
import * as TransactionScopeFactory from '../../factory/transactionScope';
import TransactionStatusType from '../../factory/transactionStatusType';
import TransactionTasksExportationStatus from '../../factory/transactionTasksExportationStatus';
import TransactionType from '../../factory/transactionType';

import OrganizationAdapter from '../../adapter/organization';
import PersonAdapter from '../../adapter/person';
import TaskAdapter from '../../adapter/task';
import TransactionAdapter from '../../adapter/transaction';
import TransactionCountAdapter from '../../adapter/transactionCount';

const debug = createDebug('sskts-domain:service:transaction:placeOrder');

/**
 * 取引開始
 */
export function start(args: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: clientUserFactory.IClientUser;
    scope: TransactionScopeFactory.ITransactionScope;
    agentId?: string;
    sellerId: string;
}) {
    return async (
        personAdapter: PersonAdapter,
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
        let person: PersonFactory.IPerson;
        if (args.agentId === undefined) {
            // 一般所有者作成
            person = await PersonFactory.create({});
        } else {
            // 所有者指定であれば存在確認
            const personDoc = await personAdapter.personModel.findById(args.agentId).exec();
            if (personDoc === null) {
                throw new ArgumentError('agentId', `person[id:${args.agentId}] not found`);
            }
            person = <PersonFactory.IPerson>personDoc.toObject();
        }

        // 売り手を取得
        const sellerDoc = await organizationAdapter.organizationModel.findById(args.sellerId).exec();
        if (sellerDoc === null) {
            throw new Error('seller not found');
        }
        const seller = <OrganizationFactory.IOrganization>sellerDoc.toObject();

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = PlaceOrderTransactionFactory.create({
            status: TransactionStatusType.InProgress,
            agent: {
                id: person.id,
                typeOf: person.typeOf,
                givenName: person.givenName,
                familyName: person.familyName,
                email: person.email,
                telephone: person.telephone,
                memberOf: person.memberOf
            },
            seller: {
                typeOf: 'MovieTheater', // todo enum管理
                id: seller.id,
                name: seller.name.ja
            },
            object: {
                clientUser: args.clientUser,
                paymentInfos: []
            },
            expires: args.expires,
            startDate: moment().toDate()
        });

        // 所有者永続化
        // createコマンドで作成すること(ありえないはずだが、万が一所有者IDが重複するようなバグがあっても、ユニークインデックスではじかれる)
        if (args.agentId === undefined) {
            debug('creating person...', person);
            await personAdapter.personModel.create({ ...person, ...{ _id: person.id } });
        }

        debug('creating transaction...');
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
                status: TransactionStatusType.InProgress,
                expires: { $lt: endDate }
            },
            {
                status: TransactionStatusType.Expired,
                endDate: endDate
            },
            { multi: true }
        ).exec();
    };
}

/**
 * ひとつの取引のタスクをエクスポートする
 */
export function exportTasks(status: TransactionStatusType) {
    return async (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => {
        const statusesTasksExportable = [TransactionStatusType.Expired, TransactionStatusType.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new ArgumentError('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }

        const transaction = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                status: status,
                tasksExportationStatus: TransactionTasksExportationStatus.Unexported
            },
            { tasksExportationStatus: TransactionTasksExportationStatus.Exporting },
            { new: true }
        ).exec()
            .then((doc) => (doc === null) ? null : <PlaceOrderTransactionFactory.ITransaction>doc.toObject());

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
                tasksExportationStatus: TransactionTasksExportationStatus.Exported,
                tasksExportedAt: moment().toDate(),
                tasks: tasks
            }
        ).exec();
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(transactionId: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => {
        const transaction = await transactionAdapter.transactionModel.findById(transactionId).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error(`trade[${transactionId}] not found.`);
                }

                return <PlaceOrderTransactionFactory.ITransaction>doc.toObject();
            });

        const tasks: TaskFactory.ITask[] = [];
        switch (transaction.status) {
            case TransactionStatusType.Confirmed:
                tasks.push(SettleSeatReservationTaskFactory.create({
                    status: TaskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(SettleGMOTaskFactoryTaskFactory.create({
                    status: TaskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(SettleMvtkTaskFactory.create({
                    status: TaskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(CreateOrderTaskFactory.create({
                    status: TaskStatus.Ready,
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
                //             status: TaskStatus.Ready,
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
            case TransactionStatusType.Expired:
                tasks.push(CancelSeatReservationTaskFactory.create({
                    status: TaskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(CancelGMOTaskFactory.create({
                    status: TaskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(CancelMvtkTaskFactory.create({
                    status: TaskStatus.Ready,
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
                tasksExportationStatus: TransactionTasksExportationStatus.Exporting,
                updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
            },
            {
                tasksExportationStatus: TransactionTasksExportationStatus.Unexported
            }
        ).exec();
    };
}

/**
 * 進行中の取引を取得する
 */
export function findInProgressById(transactionId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        return await transactionAdapter.transactionModel.findOne({
            _id: transactionId,
            typeOf: TransactionType.PlaceOrder,
            status: TransactionStatusType.InProgress
        }).exec()
            .then((doc) => {
                return (doc === null) ? monapt.None : monapt.Option(<PlaceOrderTransactionFactory.ITransaction>doc.toObject());
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
    seqMode: string;
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
    method: string,
    creditCard: ICreditCard4authorization
) {
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

                return <MovieTheaterOrganizationFactory.IOrganization>doc.toObject();
            });

        // GMOオーソリ取得
        const entryTranResult = await GMO.CreditService.entryTran({
            shopId: movieTheater.gmoInfo.shopId,
            shopPass: movieTheater.gmoInfo.shopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
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
            ...creditCard
        };
        const execTranResult = await GMO.CreditService.execTran(execTranArgs);
        debug(execTranResult);

        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        const gmoAuthorization = GMOAuthorizationFactory.create({
            price: amount,
            object: {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                amount: amount,
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                jobCd: GMO.Util.JOB_CD_AUTH,
                payType: GMO.Util.PAY_TYPE_CREDIT
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
            (paymentInfo) => paymentInfo.group === AuthorizationGroup.GMO
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
            jobCd: GMO.utils.util.JOB_CD_VOID
        });
        debug('alterTran processed', GMO.utils.util.JOB_CD_VOID);

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
    individualScreeningEvent: IndividualScreeningEventFactory.IEvent,
    offers: {
        seatSection: string;
        seatNumber: string;
        ticket: COA.services.reserve.IUpdReserveTicket;
    }[]
) {
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
        const authorization = SeatReservationAuthorizationFactory.createFromCOATmpReserve({
            price: offers.reduce((a, b) => a + b.ticket.salePrice, 0),
            updTmpReserveSeatArgs: updTmpReserveSeatArgs,
            reserveSeatsTemporarilyResult: reserveSeatsTemporarilyResult,
            tickets: offers.map((offer) => offer.ticket),
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
 * ムビチケ着券承認追加
 *
 * @param {string} transactionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @memberof service/transaction/placeOrder
 */
export function createMvtkAuthorization(transactionId: string, authorization: MvtkAuthorizationFactory.IAuthorization) {
    return async (transactionAdapter: TransactionAdapter) => {
        await transactionAdapter.transactionModel.findByIdAndUpdate(
            transactionId,
            { $push: { 'object.paymentInfos': authorization } }
        ).exec();
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

        const authorization = transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.group === AuthorizationGroup.MVTK
        );
        if (authorization === undefined) {
            throw new ArgumentError('authorizationId', '指定された承認は見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new ArgumentError('authorizationId', '指定された承認は見つかりません');
        }

        await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id,
            {
                $pull: { 'object.paymentInfos': { id: authorizationId } }
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
    profile: PersonFactory.IProfile
) {
    return async (personAdapter: PersonAdapter, transactionAdapter: TransactionAdapter) => {
        const transaction = await findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
                }

                return option.get();
            });

        // 永続化
        debug('setting person profile...');
        await personAdapter.personModel.findByIdAndUpdate(
            transaction.agent.id,
            profile
        ).exec();
        debug('person updated');

        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                status: TransactionStatusType.InProgress
            },
            {
                'agent.familyName': profile.familyName,
                'agent.givenName': profile.givenName,
                'agent.email': profile.email,
                'agent.telephone': profile.telephone
            }
        ).exec();
    };
}

/**
 * 会員情報をGMO会員として保管する
 *
 * @param {MemberOwnerFactory.IMemberOwner} memberOwner 会員所有者
 */
// async function saveGMOMember(memberOwner: MemberOwnerFactory.IOwner) {
//     // GMO会員登録
//     // GMOサイト情報は環境変数に持たせる(1システムにつき1サイト)
//     // 2回目かもしれないので、存在チェック
//     const searchMemberResult = await GMO.services.card.searchMember({
//         siteId: process.env.GMO_SITE_ID,
//         sitePass: process.env.GMO_SITE_PASS,
//         memberId: memberOwner.id
//     });
//     debug('GMO searchMember processed', searchMemberResult);

//     if (searchMemberResult !== null) {
//         // 存在していれば変更
//         const updateMemberResult = await GMO.services.card.updateMember({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: memberOwner.id,
//             memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
//         });
//         debug('GMO updateMember processed', updateMemberResult);
//     } else {
//         const saveMemberResult = await GMO.services.card.saveMember({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: memberOwner.id,
//             memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
//         });
//         debug('GMO saveMember processed', saveMemberResult);
//     }
// }

/**
 * 取引中の所有者に対してカード情報を保管する
 *
 * @export
 * @param {string} transactionId 取引ID
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} gmoCard GMOカード情報
 * @returns {TransactionOperation<void>} 取引に対する操作
 */
// export function saveCard(
//     transactionId: string,
//     ownerId: string,
//     gmoCard: GMOCardFactory.IUncheckedCardRaw | GMOCardFactory.IUncheckedCardTokenized
// ): TransactionOperation<void> {
//     return async (transactionAdapter: TransactionAdapter) => {
//         // 取引取得
//         const transaction = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec()
//             .then((doc) => {
//                 if (doc === null) {
//                     throw new ArgumentError('transactionId', `transtransaction[id:${transactionId}] not found.`);
//                 }

//                 return <TransactionFactory.ITransaction>doc.toObject();
//             });

//         // 取引から、更新対象の所有者を取り出す
//         const existingOwner = transaction.owners.find((ownerInTransaction) => ownerInTransaction.id === ownerId);
//         if (existingOwner === undefined) {
//             throw new ArgumentError('ownerId', `owner[id:${ownerId}] not found`);
//         }
//         // 万が一会員所有者でなければ不適切な操作
//         if (existingOwner.group !== OwnerGroup.MEMBER) {
//             throw new ArgumentError('ownerId', `owner[id:${ownerId}] is not a member`);
//         }

//         // 登録済みのカードがあれば削除
//         // もし会員未登録でこのサービスを使えば、この時点でGMOエラー
//         const searchCardResults = await GMO.services.card.searchCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS
//         });
//         debug('GMO searchCard processed', searchCardResults);

//         await Promise.all(searchCardResults.map(async (searchCardResult) => {
//             // 未削除であれば削除
//             if (searchCardResult.deleteFlag !== '1') {
//                 const deleteCardResult = await GMO.services.card.deleteCard({
//                     siteId: process.env.GMO_SITE_ID,
//                     sitePass: process.env.GMO_SITE_PASS,
//                     memberId: ownerId,
//                     seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
//                     cardSeq: searchCardResult.cardSeq
//                 });
//                 debug('GMO deleteCard processed', deleteCardResult);
//             }
//         }));

//         // GMOカード登録
//         const saveCardResult = await GMO.services.card.saveCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
//             cardNo: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).card_no,
//             cardPass: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).card_pass,
//             expire: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).expire,
//             holderName: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).holder_name,
//             token: (<GMOCardFactory.IUncheckedCardTokenized>gmoCard).token
//         });
//         debug('GMO saveCard processed', saveCardResult);
//     };
// }

/**
 * 取引確定
 */
export function confirm(transactionId: string) {
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
        const orderInquiryKey = OrderInquiryKeyFactory.create({
            theaterCode: seatReservationAuthorization.object.updTmpReserveSeatArgs.theaterCode,
            orderNumber: seatReservationAuthorization.result.tmpReserveNum,
            telephone: transaction.agent.telephone
        });

        // 条件が対等かどうかチェック
        if (!canBeClosed(transaction)) {
            throw new Error('transaction cannot be closed');
        }

        // 結果作成
        const order = OrderFactory.createFromBuyTransaction({
            seatReservationAuthorization: seatReservationAuthorization,
            customerName: `${transaction.agent.familyName} ${transaction.agent.givenName}`,
            seller: {
                name: transaction.seller.name,
                sameAs: ''
            },
            orderNumber: `${orderInquiryKey.theaterCode}-${orderInquiryKey.orderNumber}`,
            orderInquiryKey: orderInquiryKey
        });
        const ownershipInfos = order.acceptedOffers.map((reservation) => {
            return OwnershipInfoFactory.create({
                ownedBy: {
                    id: transaction.agent.id,
                    typeOf: transaction.agent.typeOf,
                    name: `${transaction.agent.familyName} ${transaction.agent.givenName}`
                },
                acquiredFrom: transaction.seller,
                ownedFrom: new Date(),
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: reservation
            });
        });
        const result: PlaceOrderTransactionFactory.IResult = {
            order: order,
            ownershipInfos: ownershipInfos
        };

        // ステータス変更
        debug('updating transaction...');
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                status: TransactionStatusType.InProgress
            },
            {
                status: TransactionStatusType.Confirmed,
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
 * 成立可能かどうか
 *
 * @returns {boolean}
 */
function canBeClosed(transaction: PlaceOrderTransactionFactory.ITransaction) {
    // 座席予約がなければ×
    const seatReservationAuthorization = transaction.object.seatReservation;
    if (seatReservationAuthorization === undefined) {
        return false;
    }

    // 決済情報がなければ×
    const paymentInfos = transaction.object.paymentInfos;
    if (paymentInfos.length === 0) {
        return false;
    }

    const priceBySeller = seatReservationAuthorization.price;
    const priceByAgent = paymentInfos.reduce((a, b) => a + b.price, 0);

    // 注文アイテムと決済の金額が合うかどうか
    return priceByAgent === priceBySeller;
}
