/**
 * 取引サービス
 *
 * @namespace TransactionService
 */
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
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const util = require("util");
const Notification = require("../factory/notification");
const Owner = require("../factory/owner");
const ownerGroup_1 = require("../factory/ownerGroup");
const Queue = require("../factory/queue");
const queueStatus_1 = require("../factory/queueStatus");
const Transaction = require("../factory/transaction");
const TransactionEvent = require("../factory/transactionEvent");
const transactionStatus_1 = require("../factory/transactionStatus");
const debug = createDebug('sskts-domain:service:transaction');
/**
 * 開始準備のできた取引を用意する
 *
 * @export
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 * @returns
 */
function prepare(length, expiresInSeconds) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引をlengthコ作成
        const expiresAt = moment().add(expiresInSeconds, 'seconds').toDate();
        const transactions = Array.from(Array(length).keys()).map(() => {
            return Transaction.create({
                status: transactionStatus_1.default.READY,
                owners: [],
                expires_at: expiresAt
            });
        });
        // 永続化
        debug('creating transactions...', transactions);
        yield transactionAdapter.create(transactions);
    });
}
exports.prepare = prepare;
/**
 * 匿名所有者更新
 *
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function updateAnonymousOwner(args) {
    return (ownerAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionAdapter.findById(args.transaction_id);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${args.transaction_id}] not found.`);
        }
        const transaction = optionTransaction.get();
        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === ownerGroup_1.default.ANONYMOUS);
        });
        if (!anonymousOwner) {
            throw new Error('anonymous owner not found.');
        }
        // 永続化
        debug('updating anonymous owner...');
        const option = yield ownerAdapter.findOneAndUpdate({
            _id: anonymousOwner.id
        }, {
            $set: {
                name_first: args.name_first,
                name_last: args.name_last,
                email: args.email,
                tel: args.tel
            }
        });
        if (option.isEmpty) {
            throw new Error('owner not found.');
        }
    });
}
exports.updateAnonymousOwner = updateAnonymousOwner;
/**
 * IDから取得する
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
function findById(transactionId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () { return yield transactionAdapter.findById(transactionId); });
}
exports.findById = findById;
/**
 * 取引開始
 *
 * @param {Date} expiresAt
 * @returns {OwnerAndTransactionOperation<Transaction>}
 *
 * @memberOf TransactionService
 */
function start(expiresAt) {
    return (ownerAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 一般所有者作成
        const anonymousOwner = Owner.createAnonymous({});
        // 興行主取得
        const option = yield ownerAdapter.findPromoter();
        if (option.isEmpty) {
            throw new Error('promoter not found');
        }
        const promoter = option.get();
        // 所有者永続化
        debug('storing anonymous owner...', anonymousOwner);
        yield ownerAdapter.store(anonymousOwner);
        // 取引永続化
        const update = {
            $set: {
                status: transactionStatus_1.default.UNDERWAY,
                owners: [promoter.id, anonymousOwner.id],
                expires_at: expiresAt
            }
        };
        debug('updating transaction...', update);
        const transactionOption = yield transactionAdapter.findOneAndUpdate({
            status: transactionStatus_1.default.READY
        }, update);
        if (transactionOption.isDefined) {
            const transaction = transactionOption.get();
            transaction.owners = [promoter, anonymousOwner];
            return monapt.Option(transaction);
        }
        else {
            return monapt.None;
        }
    });
}
exports.start = start;
/**
 * GMO資産承認
 *
 * @param {string} transactionId
 * @param {GMOAuthorization} authorization
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function addGMOAuthorization(transactionId, authorization) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionAdapter.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }
        const transaction = optionTransaction.get();
        // 所有者が取引に存在するかチェック
        const ownerIds = transaction.owners.map((owner) => {
            return owner.id;
        });
        if (ownerIds.indexOf(authorization.owner_from) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }
        // イベント作成
        const event = TransactionEvent.createAuthorize({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionAdapter.addEvent(event);
    });
}
exports.addGMOAuthorization = addGMOAuthorization;
/**
 * COA資産承認
 *
 * @param {string} transactionId
 * @param {COASeatReservationAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function addCOASeatReservationAuthorization(transactionId, authorization) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionAdapter.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }
        const transaction = optionTransaction.get();
        const ownerIds = transaction.owners.map((owner) => {
            return owner.id;
        });
        if (ownerIds.indexOf(authorization.owner_from) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }
        // イベント作成
        const event = TransactionEvent.createAuthorize({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionAdapter.addEvent(event);
    });
}
exports.addCOASeatReservationAuthorization = addCOASeatReservationAuthorization;
/**
 * 資産承認解除
 *
 * @param {string} transactionId
 * @param {string} authorizationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function removeAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransacton = yield transactionAdapter.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }
        const transaction = optionTransacton.get();
        const authorizations = yield transactionAdapter.findAuthorizationsById(transaction.id);
        const removedAuthorization = authorizations.find((authorization) => authorization.id === authorizationId);
        if (!removedAuthorization) {
            throw new Error(`authorization [${authorizationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = TransactionEvent.createUnauthorize({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: removedAuthorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionAdapter.addEvent(event);
    });
}
exports.removeAuthorization = removeAuthorization;
/**
 * 照合を可能にする
 *
 * @param {string} transactionId
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
function enableInquiry(transactionId, key) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 永続化
        const update = {
            $set: {
                inquiry_key: key
            }
        };
        debug('updating transaction...', update);
        const option = yield transactionAdapter.findOneAndUpdate({
            _id: transactionId,
            status: transactionStatus_1.default.UNDERWAY
        }, update);
        if (option.isEmpty) {
            throw new Error('UNDERWAY transaction not found.');
        }
    });
}
exports.enableInquiry = enableInquiry;
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
        return yield transactionAdapter.findOne({
            'inquiry_key.theater_code': key.theater_code,
            'inquiry_key.reserve_num': key.reserve_num,
            'inquiry_key.tel': key.tel,
            status: transactionStatus_1.default.CLOSED
        });
    });
}
exports.makeInquiry = makeInquiry;
/**
 * 取引成立
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function close(transactionId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionAdapter.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error('transaction not found.');
        }
        const transaction = optionTransaction.get();
        // 照会可能になっているかどうか
        if (!transaction.inquiry_key) {
            throw new Error('inquiry is not available.');
        }
        // 条件が対等かどうかチェック
        if (!(yield transactionAdapter.canBeClosed(transaction.id))) {
            throw new Error('transaction cannot be closed.');
        }
        // 永続化
        const update = {
            $set: {
                status: transactionStatus_1.default.CLOSED
            }
        };
        debug('updating transaction...', update);
        const option = yield transactionAdapter.findOneAndUpdate({
            _id: transactionId,
            status: transactionStatus_1.default.UNDERWAY
        }, update);
        if (option.isEmpty) {
            throw new Error('UNDERWAY transaction not found.');
        }
    });
}
exports.close = close;
/**
 * 取引期限切れ
 *
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function expireOne() {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 永続化
        const update = {
            $set: {
                status: transactionStatus_1.default.EXPIRED
            }
        };
        debug('updating transaction...', update);
        yield transactionAdapter.findOneAndUpdate({
            status: transactionStatus_1.default.UNDERWAY,
            expires_at: { $lt: new Date() }
        }, update);
        // 永続化結果がemptyの場合は、もう取引中ステータスではないということなので、期限切れタスクとしては成功
    });
}
exports.expireOne = expireOne;
/**
 * キュー出力
 *
 * @param {string} transactionId
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
function exportQueues(transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (transactionAdapter, queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        const option = yield transactionAdapter.findById(transactionId);
        if (option.isEmpty) {
            throw new Error('transaction not found.');
        }
        const transaction = option.get();
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
                // 開発時のみ通知
                if (process.env.NODE_ENV !== 'production') {
                    queues.push(Queue.createPushNotification({
                        notification: Notification.createEmail({
                            from: 'noreply@localhost',
                            to: 'hello@motionpicture.jp',
                            subject: 'transaction has expired',
                            content: `
transaction:\n
${util.inspect(transaction, { showHidden: true, depth: 10 })}\n
`
                        }),
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                }
                break;
            default:
                throw new Error('transaction group not implemented.');
        }
        debug('queues:', queues);
        const promises = queues.map((queue) => __awaiter(this, void 0, void 0, function* () {
            debug('storing queue...', queue);
            yield queueAdapter.store(queue);
        }));
        yield Promise.all(promises);
    });
}
exports.exportQueues = exportQueues;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function addEmail(transactionId, notification) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // イベント作成
        const event = TransactionEvent.createNotificationAdd({
            transaction: transactionId,
            occurred_at: new Date(),
            notification: notification
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionAdapter.addEvent(event);
    });
}
exports.addEmail = addEmail;
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function removeEmail(transactionId, notificationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransacton = yield transactionAdapter.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }
        const transaction = optionTransacton.get();
        const notifications = yield transactionAdapter.findNotificationsById(transaction.id);
        const removedNotification = notifications.find((notification) => notification.id === notificationId);
        if (!removedNotification) {
            throw new Error(`notification [${notificationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = TransactionEvent.createNotificationRemove({
            transaction: transactionId,
            occurred_at: new Date(),
            notification: removedNotification
        });
        // 永続化
        yield transactionAdapter.addEvent(event);
    });
}
exports.removeEmail = removeEmail;
