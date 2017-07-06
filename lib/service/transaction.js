"use strict";
/**
 * 取引サービス
 * 取引一般に対する処理はここで定義する
 * 特定の取引(ID指定)に対する処理はtransactionWithIdサービスで定義
 *
 * @namespace service/transaction
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
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const util = require("util");
const argument_1 = require("../error/argument");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const notificationGroup_1 = require("../factory/notificationGroup");
const clientUserFactory = require("../factory/clientUser");
const AnonymousOwnerFactory = require("../factory/owner/anonymous");
const ownerGroup_1 = require("../factory/ownerGroup");
const CancelGMOAuthorizationTaskFactory = require("../factory/task/cancelGMOAuthorization");
const CancelMvtkAuthorizationTaskFactory = require("../factory/task/cancelMvtkAuthorization");
const CancelSeatReservationAuthorizationTaskFactory = require("../factory/task/cancelSeatReservationAuthorization");
const SendEmailNotificationTaskFactory = require("../factory/task/sendEmailNotification");
const SettleGMOAuthorizationTaskFactoryTaskFactory = require("../factory/task/settleGMOAuthorization");
const SettleMvtkAuthorizationTaskFactory = require("../factory/task/settleMvtkAuthorization");
const SettleSeatReservationAuthorizationTaskFactory = require("../factory/task/settleSeatReservationAuthorization");
const taskStatus_1 = require("../factory/taskStatus");
const TransactionFactory = require("../factory/transaction");
const transactionStatus_1 = require("../factory/transactionStatus");
const transactionTasksExportationStatus_1 = require("../factory/transactionTasksExportationStatus");
const debug = createDebug('sskts-domain:service:transaction');
/**
 * 取引を開始する
 *
 * @export
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @param {string} args.clientUser クライアントユーザー
 * @param {TransactionScopeFactory.ITransactionScope} args.scope 取引スコープ
 * @param {TransactionScopeFactory.ITransactionScope} [args.ownerId] 所有者ID
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 * @memberof service/transaction
 */
function start(args) {
    return (ownerAdapter, transactionAdapter, transactionCountAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 利用可能かどうか
        const nextCount = yield transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }
        // 利用可能であれば、取引作成&匿名所有者作成
        let owner;
        if (args.ownerId === undefined) {
            // 一般所有者作成
            owner = AnonymousOwnerFactory.create({});
        }
        else {
            // 所有者指定であれば存在確認
            const ownerDoc = yield ownerAdapter.model.findById(args.ownerId).exec();
            if (ownerDoc === null) {
                throw new argument_1.default('ownerId', `owner[id:${args.ownerId}] not found`);
            }
            owner = ownerDoc.toObject();
        }
        // 興行主取得
        const promoterOwnerDoc = yield ownerAdapter.model.findOne({ group: ownerGroup_1.default.PROMOTER }).exec();
        if (promoterOwnerDoc === null) {
            throw new Error('promoter not found');
        }
        const promoter = promoterOwnerDoc.toObject();
        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [promoter, owner],
            client_user: args.clientUser,
            expires_at: args.expiresAt,
            started_at: moment().toDate()
        });
        // 所有者永続化
        // createコマンドで作成すること(ありえないはずだが、万が一所有者IDが重複するようなバグがあっても、ユニークインデックスではじかれる)
        if (owner.group === ownerGroup_1.default.ANONYMOUS) {
            debug('creating anonymous owner...', owner);
            const anonymousOwnerDoc = Object.assign({}, owner, { _id: owner.id });
            yield ownerAdapter.model.create(anonymousOwnerDoc);
        }
        debug('creating transaction...');
        // mongoDBに追加するために_idとowners属性を拡張
        const transactionDoc = Object.assign({}, transaction, { _id: transaction.id, owners: [promoter.id, owner.id] });
        yield transactionAdapter.transactionModel.create(transactionDoc);
        return monapt.Option(transaction);
    });
}
exports.start = start;
/**
 * 匿名所有者として取引開始する
 *
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @param {string} args.state 所有者状態
 * @param {TransactionScopeFactory.ITransactionScope} args.scope 取引スコープ
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 * @memberof service/transaction
 * @deprecated use start instead
 */
function startAsAnonymous(args) {
    const clientUser = clientUserFactory.create({
        client: '',
        state: args.state,
        scopes: []
    });
    return start({
        expiresAt: args.expiresAt,
        maxCountPerUnit: args.maxCountPerUnit,
        clientUser: clientUser,
        scope: args.scope
    });
}
exports.startAsAnonymous = startAsAnonymous;
exports.startAsAnonymous = util.deprecate(startAsAnonymous, 'sskts-domain: service.transaction.startAsAnonymous is deprecated, use service.transaction.start instead');
/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction
 */
function makeInquiry(key) {
    debug('finding a transaction...', key);
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield transactionAdapter.transactionModel.findOne({
            'inquiry_key.theater_code': key.theater_code,
            'inquiry_key.reserve_num': key.reserve_num,
            'inquiry_key.tel': key.tel,
            status: transactionStatus_1.default.CLOSED
        }).populate('owners').exec();
        return (doc === null) ? monapt.None : monapt.Option(doc.toObject());
    });
}
exports.makeInquiry = makeInquiry;
/**
 * 取引を期限切れにする
 * @memberof service/transaction
 */
function makeExpired() {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const expiredAt = moment().toDate();
        // ステータスと期限を見て更新
        yield transactionAdapter.transactionModel.update({
            status: transactionStatus_1.default.UNDERWAY,
            expires_at: { $lt: expiredAt }
        }, {
            status: transactionStatus_1.default.EXPIRED,
            expired_at: expiredAt
        }, { multi: true }).exec();
    });
}
exports.makeExpired = makeExpired;
/**
 * ひとつの取引のタスクをエクスポートする
 *
 * @param {TransactionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
function exportTasks(status) {
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const statusesTasksExportable = [transactionStatus_1.default.EXPIRED, transactionStatus_1.default.CLOSED];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new argument_1.default('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }
        const transactionDoc = yield transactionAdapter.transactionModel.findOneAndUpdate({
            status: status,
            tasks_exportation_status: transactionTasksExportationStatus_1.default.Unexported
        }, { tasks_exportation_status: transactionTasksExportationStatus_1.default.Exporting }, { new: true }).exec();
        if (transactionDoc === null) {
            return;
        }
        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = yield exportTasksById(transactionDoc.get('id'))(taskAdapter, transactionAdapter);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.get('id'), {
            tasks_exportation_status: transactionTasksExportationStatus_1.default.Exported,
            tasks_exported_at: moment().toDate(),
            tasks: tasks
        }).exec();
    });
}
exports.exportTasks = exportTasks;
/**
 * ID指定で取引のタスク出力
 *
 * @param {string} id
 * @returns {TaskAndTransactionOperation<void>}
 *
 * @memberof service/transaction
 */
function exportTasksById(id) {
    // tslint:disable-next-line:max-func-body-length
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield transactionAdapter.transactionModel.findById(id).populate('owners').exec();
        if (doc === null) {
            throw new Error(`transaction[${id}] not found.`);
        }
        const transaction = doc.toObject();
        const tasks = [];
        switch (transaction.status) {
            case transactionStatus_1.default.CLOSED:
                // 取引イベントからタスクリストを作成
                (yield transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    if (authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION) {
                        tasks.push(SettleSeatReservationAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runs_at: new Date(),
                            remaining_number_of_tries: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.GMO) {
                        tasks.push(SettleGMOAuthorizationTaskFactoryTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runs_at: new Date(),
                            remaining_number_of_tries: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.MVTK) {
                        tasks.push(SettleMvtkAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runs_at: new Date(),
                            remaining_number_of_tries: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                });
                (yield transactionAdapter.findNotificationsById(transaction.id)).forEach((notification) => {
                    if (notification.group === notificationGroup_1.default.EMAIL) {
                        tasks.push(SendEmailNotificationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runs_at: new Date(),
                            remaining_number_of_tries: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                notification: notification
                            }
                        }));
                    }
                });
                break;
            // 期限切れの場合は、タスクリストを作成する
            case transactionStatus_1.default.EXPIRED:
                (yield transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    if (authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION) {
                        tasks.push(CancelSeatReservationAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runs_at: new Date(),
                            remaining_number_of_tries: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.GMO) {
                        tasks.push(CancelGMOAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runs_at: new Date(),
                            remaining_number_of_tries: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.MVTK) {
                        tasks.push(CancelMvtkAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runs_at: new Date(),
                            remaining_number_of_tries: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                });
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
            tasks_exportation_status: transactionTasksExportationStatus_1.default.Exporting,
            updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
        }, {
            tasks_exportation_status: transactionTasksExportationStatus_1.default.Unexported
        }).exec();
    });
}
exports.reexportTasks = reexportTasks;
