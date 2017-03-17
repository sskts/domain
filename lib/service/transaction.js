"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引サービス
 * 取引一般に対する処理はここで定義する
 * 特定の取引(ID指定)に対する処理はtransactionWithIdサービスで定義
 *
 * @namespace TransactionService
 */
const clone = require("clone");
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const Owner = require("../factory/owner");
const ownerGroup_1 = require("../factory/ownerGroup");
const Queue = require("../factory/queue");
const queueStatus_1 = require("../factory/queueStatus");
const Transaction = require("../factory/transaction");
const transactionQueuesStatus_1 = require("../factory/transactionQueuesStatus");
const transactionStatus_1 = require("../factory/transactionStatus");
const debug = createDebug('sskts-domain:service:transaction');
/**
 * 開始準備のできた取引を用意する
 *
 * @export
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 */
function prepare(length, expiresInSeconds) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引を{length}コ作成
        const expiresAt = moment().add(expiresInSeconds, 'seconds').toDate();
        const transactions = Array.from(Array(length).keys()).map(() => {
            const transaction = Transaction.create({
                status: transactionStatus_1.default.READY,
                owners: [],
                expires_at: expiresAt
            });
            transaction._id = transaction.id;
            return transaction;
        });
        // 永続化
        debug('creating transactions...', transactions);
        yield transactionAdapter.transactionModel.create(transactions);
    });
}
exports.prepare = prepare;
/**
 * 取引を強制的に開始する
 *
 * @export
 * @param {Date} expiresAt
 */
function startForcibly(expiresAt) {
    return (ownerAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 一般所有者作成
        const anonymousOwner = Owner.createAnonymous({});
        // 興行主取得
        const ownerDoc = yield ownerAdapter.model.findOne({ group: ownerGroup_1.default.PROMOTER }).exec();
        if (!ownerDoc) {
            throw new Error('promoter not found');
        }
        const promoter = ownerDoc.toObject();
        const transaction = Transaction.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [promoter, anonymousOwner],
            expires_at: expiresAt
        });
        // 所有者永続化
        debug('storing anonymous owner...', anonymousOwner);
        yield ownerAdapter.model.findByIdAndUpdate(anonymousOwner.id, anonymousOwner, { new: true, upsert: true }).exec();
        // ステータスを変更&しつつ、期限も延長する
        debug('updating transaction...');
        const update = Object.assign(clone(transaction), { owners: [promoter.id, anonymousOwner.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, update, { new: true, upsert: true });
        return transaction;
    });
}
exports.startForcibly = startForcibly;
/**
 * 可能であれば取引開始する
 *
 * @param {Date} expiresAt
 * @returns {OwnerAndTransactionOperation<Promise<monapt.Option<Transaction.ITransaction>>>}
 *
 * @memberOf TransactionService
 */
function startIfPossible(expiresAt) {
    return (ownerAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 一般所有者作成
        const anonymousOwner = Owner.createAnonymous({});
        // 興行主取得
        const ownerDoc = yield ownerAdapter.model.findOne({ group: ownerGroup_1.default.PROMOTER }).exec();
        if (!ownerDoc) {
            throw new Error('promoter not found');
        }
        const promoter = ownerDoc.toObject();
        // 所有者永続化
        debug('storing anonymous owner...', anonymousOwner);
        yield ownerAdapter.model.findByIdAndUpdate(anonymousOwner.id, anonymousOwner, { new: true, upsert: true }).exec();
        // ステータスを変更&しつつ、期限も延長する
        debug('updating transaction...');
        const transactionDoc = yield transactionAdapter.transactionModel.findOneAndUpdate({
            status: transactionStatus_1.default.READY
        }, {
            status: transactionStatus_1.default.UNDERWAY,
            owners: [promoter.id, anonymousOwner.id],
            expires_at: expiresAt
        }, {
            new: true,
            upsert: false
        }).exec();
        if (transactionDoc) {
            const transaction = transactionDoc.toObject();
            transaction.owners = [promoter, anonymousOwner];
            return monapt.Option(transaction);
        }
        else {
            return monapt.None;
        }
    });
}
exports.startIfPossible = startIfPossible;
/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
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
        return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
    });
}
exports.makeInquiry = makeInquiry;
/**
 * 取引を期限切れにする
 */
function makeExpired() {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // ステータスと期限を見て更新
        yield transactionAdapter.transactionModel.update({
            status: { $in: [transactionStatus_1.default.READY, transactionStatus_1.default.UNDERWAY] },
            expires_at: { $lt: new Date() }
        }, {
            status: transactionStatus_1.default.EXPIRED
        }, { multi: true }).exec();
    });
}
exports.makeExpired = makeExpired;
/**
 * ひとつの取引のキューをエクスポートする
 */
function exportQueues() {
    return (queueAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        let transactionDoc = yield transactionAdapter.transactionModel.findOneAndUpdate({
            status: { $in: [transactionStatus_1.default.CLOSED, transactionStatus_1.default.EXPIRED] },
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        }, { queues_status: transactionQueuesStatus_1.default.EXPORTING }, { new: true }).exec();
        if (transactionDoc) {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            yield exportQueuesById(transactionDoc.get('id'))(queueAdapter, transactionAdapter);
            transactionDoc = yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.get('id'), { queues_status: transactionQueuesStatus_1.default.EXPORTED }, { new: true }).exec();
        }
        return (transactionDoc) ? transactionDoc.get('queues_status') : null;
    });
}
exports.exportQueues = exportQueues;
/**
 * キュー出力
 *
 * @param {string} id
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
function exportQueuesById(id) {
    // tslint:disable-next-line:max-func-body-length
    return (queueAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield transactionAdapter.transactionModel.findById(id).populate('owners').exec();
        if (!doc) {
            throw new Error(`transaction[${id}] not found.`);
        }
        const transaction = doc.toObject();
        const queues = [];
        switch (transaction.status) {
            case transactionStatus_1.default.CLOSED:
                // 取引イベントからキューリストを作成
                (yield transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(Queue.createSettleAuthorization({
                        authorization: authorization,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });
                (yield transactionAdapter.findNotificationsById(transaction.id)).forEach((notification) => {
                    queues.push(Queue.createPushNotification({
                        notification: notification,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });
                break;
            // 期限切れの場合は、キューリストを作成する
            case transactionStatus_1.default.EXPIRED:
                (yield transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(Queue.createCancelAuthorization({
                        authorization: authorization,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });
                // COA本予約があれば取消
                if (transaction.inquiry_key) {
                    queues.push(Queue.createDisableTransactionInquiry({
                        transaction: transaction,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                }
                // 開発時のみ通知(メール送信数が増えすぎるので中止)
                //                 if (process.env.NODE_ENV === 'development') {
                //                     await notificationService.report2developers(
                //                         '取引の期限が切れました', `
                // transaction:\n
                // ${util.inspect(transaction, { showHidden: true, depth: 10 })}\n
                // `
                //                     )();
                //                 }
                break;
            default:
                throw new Error('transaction group not implemented.');
        }
        debug('queues:', queues);
        const promises = queues.map((queue) => __awaiter(this, void 0, void 0, function* () {
            debug('storing queue...', queue);
            yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        }));
        yield Promise.all(promises);
        return queues.map((queue) => queue.id);
    });
}
exports.exportQueuesById = exportQueuesById;
/**
 * キューエクスポートリトライ
 * todo updated_atを基準にしているが、キューエクスポートトライ日時を持たせた方が安全か？
 *
 * @export
 * @param {number} intervalInMinutes
 */
function reexportQueues(intervalInMinutes) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            queues_status: transactionQueuesStatus_1.default.EXPORTING,
            updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() } // tslint:disable-line:no-magic-numbers
        }, {
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        }).exec();
    });
}
exports.reexportQueues = reexportQueues;
