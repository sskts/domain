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
const objectId_1 = require("../model/objectId");
const ownerGroup_1 = require("../model/ownerGroup");
const queueStatus_1 = require("../model/queueStatus");
const transactionStatus_1 = require("../model/transactionStatus");
const NotificationFactory = require("../factory/notification");
const OwnerFactory = require("../factory/owner");
const QueueFactory = require("../factory/queue");
const TransactionFactory = require("../factory/transaction");
const TransactionEventFactory = require("../factory/transactionEvent");
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
        const optionTransaction = yield transactionRepo.findById(objectId_1.default(args.transaction_id));
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] not found.`);
        }
        const transaction = optionTransaction.get();
        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === ownerGroup_1.default.ANONYMOUS);
        });
        if (!anonymousOwner) {
            throw new Error('anonymous owner not found.');
        }
        // 永続化
        const option = yield ownerRepo.findOneAndUpdate({
            _id: anonymousOwner._id
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
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () { return yield transactionRepo.findById(objectId_1.default(transactionId)); });
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
        const anonymousOwner = OwnerFactory.createAnonymous({
            _id: objectId_1.default()
        });
        // 興行主取得
        const option = yield ownerRepo.findPromoter();
        if (option.isEmpty) {
            throw new Error('promoter not found.');
        }
        const promoter = option.get();
        // 取引作成
        const transaction = TransactionFactory.create({
            _id: objectId_1.default(),
            status: transactionStatus_1.default.UNDERWAY,
            owners: [promoter, anonymousOwner],
            expired_at: expiredAt
        });
        // 永続化
        yield ownerRepo.store(anonymousOwner);
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
        const optionTransaction = yield transactionRepo.findById(objectId_1.default(transactionId));
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${objectId_1.default(transactionId)}] not found.`);
        }
        const transaction = optionTransaction.get();
        // 所有者が取引に存在するかチェック
        const ownerIds = transaction.owners.map((owner) => {
            return owner._id.toString();
        });
        if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }
        // イベント作成
        const event = TransactionEventFactory.createAuthorize({
            _id: objectId_1.default(),
            transaction: transaction._id,
            occurred_at: new Date(),
            authorization: authorization
        });
        // 永続化
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
        const optionTransaction = yield transactionRepo.findById(objectId_1.default(transactionId));
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${objectId_1.default(transactionId)}] not found.`);
        }
        const transaction = optionTransaction.get();
        const ownerIds = transaction.owners.map((owner) => {
            return owner._id.toString();
        });
        if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }
        // イベント作成
        const event = TransactionEventFactory.createAuthorize({
            _id: objectId_1.default(),
            transaction: transaction._id,
            occurred_at: new Date(),
            authorization: authorization
        });
        // 永続化
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
        const optionTransacton = yield transactionRepo.findById(objectId_1.default(transactionId));
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }
        const transaction = optionTransacton.get();
        const authorizations = yield transactionRepo.findAuthorizationsById(transaction._id);
        const removedAuthorization = authorizations.find((authorization) => authorization._id.toString() === authorizationId);
        if (!removedAuthorization) {
            throw new Error(`authorization [${authorizationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = TransactionEventFactory.createUnauthorize({
            _id: objectId_1.default(),
            transaction: transaction._id,
            occurred_at: new Date(),
            authorization: removedAuthorization
        });
        // 永続化
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
        const option = yield transactionRepo.findOneAndUpdate({
            _id: objectId_1.default(transactionId),
            status: transactionStatus_1.default.UNDERWAY
        }, {
            $set: {
                inquiry_key: key
            }
        });
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
        const optionTransaction = yield transactionRepo.findById(objectId_1.default(transactionId));
        if (optionTransaction.isEmpty) {
            throw new Error('transaction not found.');
        }
        const transaction = optionTransaction.get();
        // 照会可能になっているかどうか
        if (!transaction.isInquiryAvailable()) {
            throw new Error('inquiry is not available.');
        }
        // 条件が対等かどうかチェック
        if (!(yield transactionRepo.canBeClosed(transaction._id))) {
            throw new Error('transaction cannot be closed.');
        }
        // 永続化
        const option = yield transactionRepo.findOneAndUpdate({
            _id: objectId_1.default(transactionId),
            status: transactionStatus_1.default.UNDERWAY
        }, {
            $set: {
                status: transactionStatus_1.default.CLOSED
            }
        });
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
        yield transactionRepo.findOneAndUpdate({
            status: transactionStatus_1.default.UNDERWAY,
            expired_at: { $lt: new Date() }
        }, {
            $set: {
                status: transactionStatus_1.default.EXPIRED
            }
        });
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
        const option = yield transactionRepo.findById(objectId_1.default(transactionId));
        if (option.isEmpty) {
            throw new Error('transaction not found.');
        }
        const transaction = option.get();
        const queues = [];
        switch (transaction.status) {
            case transactionStatus_1.default.CLOSED:
                // 取引イベントからキューリストを作成
                (yield transactionRepo.findAuthorizationsById(transaction._id)).forEach((authorization) => {
                    queues.push(QueueFactory.createSettleAuthorization({
                        _id: objectId_1.default(),
                        authorization: authorization,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });
                (yield transactionRepo.findNotificationsById(transaction._id)).forEach((notification) => {
                    queues.push(QueueFactory.createPushNotification({
                        _id: objectId_1.default(),
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
                (yield transactionRepo.findAuthorizationsById(transaction._id)).forEach((authorization) => {
                    queues.push(QueueFactory.createCancelAuthorization({
                        _id: objectId_1.default(),
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
                    queues.push(QueueFactory.createDisableTransactionInquiry({
                        _id: objectId_1.default(),
                        transaction_id: transaction._id,
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                }
                // todo おそらく開発時のみ
                queues.push(QueueFactory.createPushNotification({
                    _id: objectId_1.default(),
                    notification: NotificationFactory.createEmail({
                        _id: objectId_1.default(),
                        from: 'noreply@localhost',
                        to: 'hello@motionpicture.jp',
                        subject: 'transaction expired',
                        content: `
取引の期限がきれました
_id: ${transaction._id}
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
        const event = TransactionEventFactory.createNotificationAdd({
            _id: objectId_1.default(),
            transaction: objectId_1.default(transactionId),
            occurred_at: new Date(),
            notification: notification
        });
        // 永続化
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
        const optionTransacton = yield transactionRepo.findById(objectId_1.default(transactionId));
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }
        const transaction = optionTransacton.get();
        const notifications = yield transactionRepo.findNotificationsById(transaction._id);
        const removedNotification = notifications.find((notification) => notification._id.toString() === notificationId);
        if (!removedNotification) {
            throw new Error(`notification [${notificationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = TransactionEventFactory.createNotificationRemove({
            _id: objectId_1.default(),
            transaction: objectId_1.default(transactionId),
            occurred_at: new Date(),
            notification: removedNotification
        });
        // 永続化
        yield transactionRepo.addEvent(event);
    });
}
exports.removeEmail = removeEmail;
