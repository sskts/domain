"use strict";
/**
 * 取引サービス
 *
 * @namespace service/transaction/placeOrder
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
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const argument_1 = require("../../error/argument");
const GMOAuthorizationFactory = require("../../factory/authorization/gmo");
const SeatReservationAuthorizationFactory = require("../../factory/authorization/seatReservation");
const authorizationGroup_1 = require("../../factory/authorizationGroup");
const OrderFactory = require("../../factory/order");
const OrderInquiryKeyFactory = require("../../factory/orderInquiryKey");
const OwnershipInfoFactory = require("../../factory/ownershipInfo");
const PersonFactory = require("../../factory/person");
const CancelGMOTaskFactory = require("../../factory/task/cancelGMO");
const CancelMvtkTaskFactory = require("../../factory/task/cancelMvtk");
const CancelSeatReservationTaskFactory = require("../../factory/task/cancelSeatReservation");
const CreateOrderTaskFactory = require("../../factory/task/createOrder");
const SettleGMOTaskFactoryTaskFactory = require("../../factory/task/settleGMO");
const SettleMvtkTaskFactory = require("../../factory/task/settleMvtk");
const SettleSeatReservationTaskFactory = require("../../factory/task/settleSeatReservation");
const taskStatus_1 = require("../../factory/taskStatus");
const PlaceOrderTransactionFactory = require("../../factory/transaction/placeOrder");
const transactionStatusType_1 = require("../../factory/transactionStatusType");
const transactionTasksExportationStatus_1 = require("../../factory/transactionTasksExportationStatus");
const transactionType_1 = require("../../factory/transactionType");
const debug = createDebug('sskts-domain:service:transaction:placeOrder');
/**
 * 取引開始
 */
function start(args) {
    return (personAdapter, organizationAdapter, transactionAdapter, transactionCountAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 利用可能かどうか
        const nextCount = yield transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }
        // 利用可能であれば、取引作成&匿名所有者作成
        let person;
        if (args.agentId === undefined) {
            // 一般所有者作成
            person = yield PersonFactory.create({});
        }
        else {
            // 所有者指定であれば存在確認
            const personDoc = yield personAdapter.personModel.findById(args.agentId).exec();
            if (personDoc === null) {
                throw new argument_1.default('agentId', `person[id:${args.agentId}] not found`);
            }
            person = personDoc.toObject();
        }
        // 売り手を取得
        const sellerDoc = yield organizationAdapter.organizationModel.findById(args.sellerId).exec();
        if (sellerDoc === null) {
            throw new Error('seller not found');
        }
        const seller = sellerDoc.toObject();
        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = PlaceOrderTransactionFactory.create({
            status: transactionStatusType_1.default.InProgress,
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
                typeOf: 'MovieTheater',
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
            yield personAdapter.personModel.create(Object.assign({}, person, { _id: person.id }));
        }
        debug('creating transaction...');
        // mongoDBに追加するために_id属性を拡張
        yield transactionAdapter.transactionModel.create(Object.assign({}, transaction, { _id: transaction.id }));
        return monapt.Option(transaction);
    });
}
exports.start = start;
/**
 * 取引を期限切れにする
 */
function makeExpired() {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const endDate = moment().toDate();
        // ステータスと期限を見て更新
        yield transactionAdapter.transactionModel.update({
            status: transactionStatusType_1.default.InProgress,
            expires: { $lt: endDate }
        }, {
            status: transactionStatusType_1.default.Expired,
            endDate: endDate
        }, { multi: true }).exec();
    });
}
exports.makeExpired = makeExpired;
/**
 * ひとつの取引のタスクをエクスポートする
 */
function exportTasks(status) {
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const statusesTasksExportable = [transactionStatusType_1.default.Expired, transactionStatusType_1.default.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new argument_1.default('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }
        const transaction = yield transactionAdapter.transactionModel.findOneAndUpdate({
            status: status,
            tasksExportationStatus: transactionTasksExportationStatus_1.default.Unexported
        }, { tasksExportationStatus: transactionTasksExportationStatus_1.default.Exporting }, { new: true }).exec()
            .then((doc) => (doc === null) ? null : doc.toObject());
        if (transaction === null) {
            return;
        }
        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = yield exportTasksById(transaction.id)(taskAdapter, transactionAdapter);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            tasksExportationStatus: transactionTasksExportationStatus_1.default.Exported,
            tasksExportedAt: moment().toDate(),
            tasks: tasks
        }).exec();
    });
}
exports.exportTasks = exportTasks;
/**
 * ID指定で取引のタスク出力
 */
function exportTasksById(transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionAdapter.transactionModel.findById(transactionId).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error(`trade[${transactionId}] not found.`);
            }
            return doc.toObject();
        });
        const tasks = [];
        switch (transaction.status) {
            case transactionStatusType_1.default.Confirmed:
                tasks.push(SettleSeatReservationTaskFactory.create({
                    status: taskStatus_1.default.Ready,
                    runsAt: new Date(),
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(SettleGMOTaskFactoryTaskFactory.create({
                    status: taskStatus_1.default.Ready,
                    runsAt: new Date(),
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(SettleMvtkTaskFactory.create({
                    status: taskStatus_1.default.Ready,
                    runsAt: new Date(),
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(CreateOrderTaskFactory.create({
                    status: taskStatus_1.default.Ready,
                    runsAt: new Date(),
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
            case transactionStatusType_1.default.Expired:
                tasks.push(CancelSeatReservationTaskFactory.create({
                    status: taskStatus_1.default.Ready,
                    runsAt: new Date(),
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(CancelGMOTaskFactory.create({
                    status: taskStatus_1.default.Ready,
                    runsAt: new Date(),
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transaction: transaction
                    }
                }));
                tasks.push(CancelMvtkTaskFactory.create({
                    status: taskStatus_1.default.Ready,
                    runsAt: new Date(),
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
                throw new argument_1.default('id', 'transaction group not implemented.');
        }
        debug('tasks prepared', tasks);
        yield Promise.all(tasks.map((task) => __awaiter(this, void 0, void 0, function* () {
            debug('storing task...', task);
            yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        })));
        return tasks;
    });
}
exports.exportTasksById = exportTasksById;
/**
 * タスクエクスポートリトライ
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
function reexportTasks(intervalInMinutes) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            tasksExportationStatus: transactionTasksExportationStatus_1.default.Exporting,
            updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
        }, {
            tasksExportationStatus: transactionTasksExportationStatus_1.default.Unexported
        }).exec();
    });
}
exports.reexportTasks = reexportTasks;
/**
 * 進行中の取引を取得する
 */
function findInProgressById(transactionId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        return yield transactionAdapter.transactionModel.findOne({
            _id: transactionId,
            typeOf: transactionType_1.default.PlaceOrder,
            status: transactionStatusType_1.default.InProgress
        }).exec()
            .then((doc) => {
            return (doc === null) ? monapt.None : monapt.Option(doc.toObject());
        });
    });
}
exports.findInProgressById = findInProgressById;
/**
 * GMOクレジットカードオーソリ
 */
function authorizeGMOCard(transactionId, gmoTransaction) {
    return (organizationAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        // GMOショップ情報取得
        const movieTheater = yield organizationAdapter.organizationModel.findById(transaction.seller.id).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error('movieTheater not found');
            }
            return doc.toObject();
        });
        // GMOオーソリ取得
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: movieTheater.gmoInfo.shopId,
            shopPass: movieTheater.gmoInfo.shopPass,
            orderId: gmoTransaction.orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: gmoTransaction.amount
        });
        const execTranResult = yield GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: gmoTransaction.orderId,
            method: gmoTransaction.method,
            cardNo: gmoTransaction.cardNo,
            expire: gmoTransaction.expire,
            securityCode: gmoTransaction.securityCode,
            token: gmoTransaction.token,
            memberId: gmoTransaction.memberId,
            seqMode: gmoTransaction.seqMode,
            cardSeq: gmoTransaction.cardSeq,
            cardPass: gmoTransaction.cardPass
        });
        debug(execTranResult);
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        const gmoAuthorization = GMOAuthorizationFactory.create({
            price: gmoTransaction.amount,
            object: {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: gmoTransaction.orderId,
                amount: gmoTransaction.amount,
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                jobCd: GMO.Util.JOB_CD_AUTH,
                payType: GMO.Util.PAY_TYPE_CREDIT
            },
            result: execTranResult
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionId, { $push: { 'object.paymentInfos': gmoAuthorization } }).exec();
        debug('GMOAuthorization added.');
        return gmoAuthorization;
    });
}
exports.authorizeGMOCard = authorizeGMOCard;
function cancelGMOAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        const authorization = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.group === authorizationGroup_1.default.GMO);
        if (authorization === undefined) {
            throw new argument_1.default('authorizationId', '指定されたオーソリは見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new argument_1.default('authorizationId', '指定されたオーソリは見つかりません');
        }
        // 決済取消
        yield GMO.services.credit.alterTran({
            shopId: authorization.object.shopId,
            shopPass: authorization.object.shopPass,
            accessId: authorization.object.accessId,
            accessPass: authorization.object.accessPass,
            jobCd: GMO.utils.util.JOB_CD_VOID
        });
        debug('alterTran processed', GMO.utils.util.JOB_CD_VOID);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            $pull: { 'object.paymentInfos': { id: authorizationId } }
        }).exec();
    });
}
exports.cancelGMOAuthorization = cancelGMOAuthorization;
function createSeatReservationAuthorization(transactionId, individualScreeningEvent, offers) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
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
        const reserveSeatsTemporarilyResult = yield COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
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
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, { 'object.seatReservation': authorization }).exec();
        debug('coaAuthorization added.');
        return authorization;
    });
}
exports.createSeatReservationAuthorization = createSeatReservationAuthorization;
function cancelSeatReservationAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        const authorization = transaction.object.seatReservation;
        if (authorization === undefined) {
            throw new argument_1.default('authorizationId', '指定された座席予約は見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new argument_1.default('authorizationId', '指定された座席予約は見つかりません');
        }
        // 座席仮予約削除
        debug('delTmpReserve processing...', authorization);
        yield COA.services.reserve.delTmpReserve({
            theaterCode: authorization.object.updTmpReserveSeatArgs.theaterCode,
            dateJouei: authorization.object.updTmpReserveSeatArgs.dateJouei,
            titleCode: authorization.object.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: authorization.object.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: authorization.object.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: authorization.result.tmpReserveNum
        });
        debug('delTmpReserve processed');
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            $unset: { 'object.seatReservation': 1 }
        }).exec();
    });
}
exports.cancelSeatReservationAuthorization = cancelSeatReservationAuthorization;
/**
 * ムビチケ着券承認追加
 *
 * @param {string} transactionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @memberof service/transaction/placeOrder
 */
function createMvtkAuthorization(transactionId, authorization) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionId, { $push: { 'object.paymentInfos': authorization } }).exec();
    });
}
exports.createMvtkAuthorization = createMvtkAuthorization;
function cancelMvtkAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        const authorization = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.group === authorizationGroup_1.default.MVTK);
        if (authorization === undefined) {
            throw new argument_1.default('authorizationId', '指定された承認は見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new argument_1.default('authorizationId', '指定された承認は見つかりません');
        }
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            $pull: { 'object.paymentInfos': { id: authorizationId } }
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
function setAgentProfile(transactionId, profile) {
    return (personAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        // 永続化
        debug('setting person profile...');
        yield personAdapter.personModel.findByIdAndUpdate(transaction.agent.id, profile).exec();
        debug('person updated');
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: transactionId,
            status: transactionStatusType_1.default.InProgress
        }, {
            'agent.familyName': profile.familyName,
            'agent.givenName': profile.givenName,
            'agent.email': profile.email,
            'agent.telephone': profile.telephone
        }).exec();
    });
}
exports.setAgentProfile = setAgentProfile;
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
function confirm(transactionId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        // 照会可能になっているかどうか
        const seatReservationAuthorization = transaction.object.seatReservation;
        if (seatReservationAuthorization === undefined) {
            throw new argument_1.default('transactionId', '座席予約が見つかりません');
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
        const result = {
            order: order,
            ownershipInfos: ownershipInfos
        };
        // ステータス変更
        debug('updating transaction...');
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: transactionId,
            status: transactionStatusType_1.default.InProgress
        }, {
            status: transactionStatusType_1.default.Confirmed,
            endDate: moment().toDate(),
            result: result
        }, { new: true }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error('進行中の購入アクションはありません');
            }
        });
        return order;
    });
}
exports.confirm = confirm;
/**
 * 成立可能かどうか
 *
 * @returns {boolean}
 */
function canBeClosed(transaction) {
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
