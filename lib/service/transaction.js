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
const createDebug = require("debug");
const notification_1 = require("../model/notification");
const objectId_1 = require("../model/objectId");
const owner_1 = require("../model/owner");
const ownerGroup_1 = require("../model/ownerGroup");
const queue_1 = require("../model/queue");
const queueStatus_1 = require("../model/queueStatus");
const transaction_1 = require("../model/transaction");
const transactionEvent_1 = require("../model/transactionEvent");
const transactionStatus_1 = require("../model/transactionStatus");
const debug = createDebug('sskts-domain:service:transaction');
/**
 * 匿名所有者更新
 *
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
function updateAnonymousOwner(args) {
    return (ownerRepo, transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionRepo.findById(args.transaction_id);
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
        const option = yield ownerRepo.findOneAndUpdate({
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () { return yield transactionRepo.findById(transactionId); });
}
exports.findById = findById;
/**
 * 取引開始
 *
 * @param {Date} expiredAt
 * @returns {OwnerAndTransactionOperation<Transaction>}
 *
 * @memberOf TransactionService
 */
function start(expiredAt) {
    return (ownerRepo, transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 一般所有者作成
        const anonymousOwner = owner_1.default.createAnonymous({
            id: objectId_1.default().toString()
        });
        // 興行主取得
        const option = yield ownerRepo.findPromoter();
        if (option.isEmpty) {
            throw new Error('promoter not found.');
        }
        const promoter = option.get();
        // 取引作成
        const transaction = transaction_1.default.create({
            id: objectId_1.default().toString(),
            status: transactionStatus_1.default.UNDERWAY,
            owners: [promoter, anonymousOwner],
            expired_at: expiredAt
        });
        // 永続化
        debug('storing anonymous owner...', anonymousOwner);
        yield ownerRepo.store(anonymousOwner);
        debug('storing transaction...', transaction);
        yield transactionRepo.store(transaction);
        return transaction;
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionRepo.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }
        const transaction = optionTransaction.get();
        // 所有者が取引に存在するかチェック
        const ownerIds = transaction.owners.map((owner) => {
            return owner.id.toString();
        });
        if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }
        // イベント作成
        const event = transactionEvent_1.default.createAuthorize({
            id: objectId_1.default().toString(),
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionRepo.addEvent(event);
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionRepo.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }
        const transaction = optionTransaction.get();
        const ownerIds = transaction.owners.map((owner) => {
            return owner.id.toString();
        });
        if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }
        // イベント作成
        const event = transactionEvent_1.default.createAuthorize({
            id: objectId_1.default().toString(),
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionRepo.addEvent(event);
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransacton = yield transactionRepo.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }
        const transaction = optionTransacton.get();
        const authorizations = yield transactionRepo.findAuthorizationsById(transaction.id);
        const removedAuthorization = authorizations.find((authorization) => authorization.id.toString() === authorizationId);
        if (!removedAuthorization) {
            throw new Error(`authorization [${authorizationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = transactionEvent_1.default.createUnauthorize({
            id: objectId_1.default().toString(),
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: removedAuthorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionRepo.addEvent(event);
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 永続化
        const update = {
            $set: {
                inquiry_key: key
            }
        };
        debug('updating transaction...', update);
        const option = yield transactionRepo.findOneAndUpdate({
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        return yield transactionRepo.findOne({
            inquiry_key: key,
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransaction = yield transactionRepo.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error('transaction not found.');
        }
        const transaction = optionTransaction.get();
        // 照会可能になっているかどうか
        if (!transaction.isInquiryAvailable()) {
            throw new Error('inquiry is not available.');
        }
        // 条件が対等かどうかチェック
        if (!(yield transactionRepo.canBeClosed(transaction.id))) {
            throw new Error('transaction cannot be closed.');
        }
        // 永続化
        const update = {
            $set: {
                status: transactionStatus_1.default.CLOSED
            }
        };
        debug('updating transaction...', update);
        const option = yield transactionRepo.findOneAndUpdate({
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 永続化
        const update = {
            $set: {
                status: transactionStatus_1.default.EXPIRED
            }
        };
        debug('updating transaction...', update);
        yield transactionRepo.findOneAndUpdate({
            status: transactionStatus_1.default.UNDERWAY,
            expired_at: { $lt: new Date() }
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
    return (transactionRepo, queueRepo) => __awaiter(this, void 0, void 0, function* () {
        const option = yield transactionRepo.findById(transactionId);
        if (option.isEmpty) {
            throw new Error('transaction not found.');
        }
        const transaction = option.get();
        const queues = [];
        switch (transaction.status) {
            case transactionStatus_1.default.CLOSED:
                // 取引イベントからキューリストを作成
                (yield transactionRepo.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(queue_1.default.createSettleAuthorization({
                        id: objectId_1.default().toString(),
                        authorization: authorization,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });
                (yield transactionRepo.findNotificationsById(transaction.id)).forEach((notification) => {
                    queues.push(queue_1.default.createPushNotification({
                        id: objectId_1.default().toString(),
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
                (yield transactionRepo.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(queue_1.default.createCancelAuthorization({
                        id: objectId_1.default().toString(),
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
                if (transaction.isInquiryAvailable()) {
                    queues.push(queue_1.default.createDisableTransactionInquiry({
                        id: objectId_1.default().toString(),
                        transaction_id: transaction.id,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                }
                // todo おそらく開発時のみ
                queues.push(queue_1.default.createPushNotification({
                    id: objectId_1.default().toString(),
                    notification: notification_1.default.createEmail({
                        id: objectId_1.default().toString(),
                        from: 'noreply@localhost',
                        to: 'hello@motionpicture.jp',
                        subject: 'transaction expired',
                        content: `
取引の期限がきれました
_id: ${transaction.id}
expired_at: ${transaction.expired_at}
`
                    }),
                    status: queueStatus_1.default.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                }));
                break;
            default:
                throw new Error('transaction group not implemented.');
        }
        debug('queues:', queues);
        const promises = queues.map((queue) => __awaiter(this, void 0, void 0, function* () {
            debug('storing queue...', queue);
            yield queueRepo.store(queue);
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // イベント作成
        const event = transactionEvent_1.default.createNotificationAdd({
            id: objectId_1.default().toString(),
            transaction: transactionId,
            occurred_at: new Date(),
            notification: notification
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionRepo.addEvent(event);
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const optionTransacton = yield transactionRepo.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }
        const transaction = optionTransacton.get();
        const notifications = yield transactionRepo.findNotificationsById(transaction.id);
        const removedNotification = notifications.find((notification) => notification.id.toString() === notificationId);
        if (!removedNotification) {
            throw new Error(`notification [${notificationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = transactionEvent_1.default.createNotificationRemove({
            id: objectId_1.default().toString(),
            transaction: transactionId,
            occurred_at: new Date(),
            notification: removedNotification
        });
        // 永続化
        yield transactionRepo.addEvent(event);
    });
}
exports.removeEmail = removeEmail;
