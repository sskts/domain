"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const objectId_1 = require("../../model/objectId");
const ownerGroup_1 = require("../../model/ownerGroup");
const queueStatus_1 = require("../../model/queueStatus");
const transactionEventGroup_1 = require("../../model/transactionEventGroup");
const transactionStatus_1 = require("../../model/transactionStatus");
const notification_1 = require("../../factory/notification");
const owner_1 = require("../../factory/owner");
const queue_1 = require("../../factory/queue");
const transaction_1 = require("../../factory/transaction");
const transactionEvent_1 = require("../../factory/transactionEvent");
/**
 * 取引サービス
 *
 * @class TransactionServiceInterpreter
 * @implements {TransactionService}
 */
class TransactionServiceInterpreter {
    /**
     * 匿名所有者更新
     *
     * @returns {OwnerAndTransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    updateAnonymousOwner(args) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            const optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] not found.`);
            const transaction = optionTransaction.get();
            const anonymousOwner = transaction.owners.find((owner) => {
                return (owner.group === ownerGroup_1.default.ANONYMOUS);
            });
            if (!anonymousOwner)
                throw new Error("anonymous owner not found.");
            // 永続化
            const option = yield ownerRepository.findOneAndUpdate({
                _id: anonymousOwner._id,
            }, {
                $set: {
                    name_first: args.name_first,
                    name_last: args.name_last,
                    email: args.email,
                    tel: args.tel,
                },
            });
            if (option.isEmpty)
                throw new Error("owner not found.");
        });
    }
    /**
     * IDから取得する
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    findById(transactionId) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            return yield transactionRepository.findById(objectId_1.default(transactionId));
        });
    }
    /**
     * 取引開始
     *
     * @param {Date} expiredAt
     * @returns {OwnerAndTransactionOperation<Transaction>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    start(expiredAt) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 一般所有者作成
            const anonymousOwner = owner_1.default.createAnonymous({
                _id: objectId_1.default(),
            });
            // 興行主取得
            const option = yield ownerRepository.findPromoter();
            if (option.isEmpty)
                throw new Error("promoter not found.");
            const promoter = option.get();
            // イベント作成
            const event = transactionEvent_1.default.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.START,
                occurred_at: new Date(),
            });
            // 取引作成
            const transaction = transaction_1.default.create({
                _id: objectId_1.default(),
                status: transactionStatus_1.default.UNDERWAY,
                events: [event],
                owners: [promoter, anonymousOwner],
                expired_at: expiredAt,
            });
            // 永続化
            yield ownerRepository.store(anonymousOwner);
            yield transactionRepository.store(transaction);
            return transaction;
        });
    }
    /**
     * GMO資産承認
     *
     * @param {string} transactionId
     * @param {GMOAuthorization} authorization
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    addGMOAuthorization(transactionId, authorization) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            const optionTransaction = yield transactionRepository.findById(objectId_1.default(transactionId));
            if (optionTransaction.isEmpty)
                throw new Error(`transaction[${objectId_1.default(transactionId)}] not found.`);
            const transaction = optionTransaction.get();
            // 所有者が取引に存在するかチェック
            const ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
                throw new Error(`transaction[${objectId_1.default(transactionId)}] does not contain a owner[${authorization.owner_from.toString()}].`);
            }
            if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
                throw new Error(`transaction[${objectId_1.default(transactionId)}] does not contain a owner[${authorization.owner_to.toString()}].`);
            }
            // 永続化
            yield this.pushAuthorization({
                transaction_id: transactionId,
                authorization: authorization,
            })(transactionRepository);
            // return authorization;
        });
    }
    /**
     * COA資産承認
     *
     * @param {string} transactionId
     * @param {COASeatReservationAuthorization} authorization
     * @returns {OwnerAndTransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    addCOASeatReservationAuthorization(transactionId, authorization) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            const optionTransaction = yield transactionRepository.findById(objectId_1.default(transactionId));
            if (optionTransaction.isEmpty)
                throw new Error(`transaction[${objectId_1.default(transactionId)}] not found.`);
            const transaction = optionTransaction.get();
            const ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
                throw new Error(`transaction[${objectId_1.default(transactionId)}] does not contain a owner[${authorization.owner_from.toString()}].`);
            }
            if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
                throw new Error(`transaction[${objectId_1.default(transactionId)}] does not contain a owner[${authorization.owner_to.toString()}].`);
            }
            // 永続化
            yield this.pushAuthorization({
                transaction_id: transactionId,
                authorization: authorization,
            })(transactionRepository);
            // return authorization;
        });
    }
    /**
     * 資産承認解除
     *
     * @param {string} transactionId
     * @param {string} authorizationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    removeAuthorization(transactionId, authorizationId) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            const optionTransacton = yield transactionRepository.findById(objectId_1.default(transactionId));
            if (optionTransacton.isEmpty)
                throw new Error("tranasction not found.");
            const transaction = optionTransacton.get();
            const authorizations = transaction.authorizations();
            const removedAuthorization = authorizations.find((authorization) => {
                return (authorization._id.toString() === authorizationId);
            });
            if (!removedAuthorization)
                throw new Error(`authorization [${authorizationId}] not found in the transaction.`);
            // イベント作成
            const event = transactionEvent_1.default.createUnauthorize({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                authorization: removedAuthorization,
            });
            // 永続化
            const option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(transactionId),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    /**
     * 照合を可能にする
     *
     * @param {string} transactionId
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    enableInquiry(transactionId, key) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 永続化
            const option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(transactionId),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $set: {
                    inquiry_key: key,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    /**
     * 照会する
     *
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    makeInquiry(key) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            return yield transactionRepository.findOne({
                inquiry_key: key,
                status: transactionStatus_1.default.CLOSED,
            });
        });
    }
    /**
     * 取引成立
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    close(transactionId) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            const optionTransaction = yield transactionRepository.findById(objectId_1.default(transactionId));
            if (optionTransaction.isEmpty)
                throw new Error("transaction not found.");
            const transaction = optionTransaction.get();
            // 照会可能になっているかどうか
            if (!transaction.isInquiryAvailable())
                throw new Error("inquiry is not available.");
            // 条件が対等かどうかチェック
            if (!transaction.canBeClosed())
                throw new Error("transaction cannot be closed.");
            // キューリストを事前作成
            const queues = [];
            transaction.authorizations().forEach((authorization) => {
                queues.push(queue_1.default.createSettleAuthorization({
                    _id: objectId_1.default(),
                    authorization: authorization,
                    status: queueStatus_1.default.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: [],
                }));
            });
            transaction.notifications().forEach((notification) => {
                queues.push(queue_1.default.createPushNotification({
                    _id: objectId_1.default(),
                    notification: notification,
                    status: queueStatus_1.default.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: [],
                }));
            });
            // イベント作成
            const event = transactionEvent_1.default.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.CLOSE,
                occurred_at: new Date(),
            });
            // 永続化
            const option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(transactionId),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $set: {
                    status: transactionStatus_1.default.CLOSED,
                    queues: queues,
                },
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    /**
     * 取引期限切れ
     *
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    expireOne() {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // イベント作成
            const event = transactionEvent_1.default.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.EXPIRE,
                occurred_at: new Date(),
            });
            // 永続化
            yield transactionRepository.findOneAndUpdate({
                status: transactionStatus_1.default.UNDERWAY,
                expired_at: { $lt: new Date() },
            }, {
                $set: {
                    status: transactionStatus_1.default.EXPIRED,
                },
                $push: {
                    events: event,
                },
            });
            // 永続化結果がemptyの場合は、もう取引中ステータスではないということなので、期限切れタスクとしては成功
        });
    }
    /**
     * キュー出力
     *
     * @param {string} transactionId
     * @returns {TransactionAndQueueOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    exportQueues(transactionId) {
        return (transactionRepository, queueRepository) => __awaiter(this, void 0, void 0, function* () {
            const option = yield transactionRepository.findById(objectId_1.default(transactionId));
            if (option.isEmpty)
                throw new Error("transaction not found.");
            const transaction = option.get();
            let queues;
            switch (transaction.status) {
                // 成立の場合は、あらかじめキューリストが作成されている
                case transactionStatus_1.default.CLOSED:
                    queues = transaction.queues;
                    break;
                // 期限切れの場合は、キューリストを作成する
                case transactionStatus_1.default.EXPIRED:
                    queues = [];
                    transaction.authorizations().forEach((authorization) => {
                        queues.push(queue_1.default.createCancelAuthorization({
                            _id: objectId_1.default(),
                            authorization: authorization,
                            status: queueStatus_1.default.UNEXECUTED,
                            run_at: new Date(),
                            max_count_try: 10,
                            last_tried_at: null,
                            count_tried: 0,
                            results: [],
                        }));
                    });
                    // COA本予約があれば取消
                    if (transaction.isInquiryAvailable()) {
                        queues.push(queue_1.default.createDisableTransactionInquiry({
                            _id: objectId_1.default(),
                            transaction_id: transaction._id,
                            status: queueStatus_1.default.UNEXECUTED,
                            run_at: new Date(),
                            max_count_try: 10,
                            last_tried_at: null,
                            count_tried: 0,
                            results: [],
                        }));
                    }
                    // TODO おそらく開発時のみ
                    const eventStart = transaction.events.find((event) => (event.group === transactionEventGroup_1.default.START));
                    queues.push(queue_1.default.createPushNotification({
                        _id: objectId_1.default(),
                        notification: notification_1.default.createEmail({
                            _id: objectId_1.default(),
                            from: "noreply@localhost",
                            to: "hello@motionpicture.jp",
                            subject: "transaction expired",
                            content: `
取引の期限がきれました
_id: ${transaction._id}
created_at: ${(eventStart) ? eventStart.occurred_at : ""}
`,
                        }),
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: [],
                    }));
                    break;
                default:
                    throw new Error("transaction group not implemented.");
            }
            const promises = queues.map((queue) => __awaiter(this, void 0, void 0, function* () {
                yield queueRepository.store(queue);
            }));
            yield Promise.all(promises);
        });
    }
    /**
     * メール追加
     *
     * @param {string} transactionId
     * @param {EmailNotification} notification
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    addEmail(transactionId, notification) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // イベント作成
            const event = transactionEvent_1.default.createNotificationAdd({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                notification: notification,
            });
            // 永続化
            const option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(transactionId),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    /**
     * メール削除
     *
     * @param {string} transactionId
     * @param {string} notificationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    removeEmail(transactionId, notificationId) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            const optionTransacton = yield transactionRepository.findById(objectId_1.default(transactionId));
            if (optionTransacton.isEmpty)
                throw new Error("tranasction not found.");
            const transaction = optionTransacton.get();
            const notifications = transaction.notifications();
            const removedNotification = notifications.find((notification) => {
                return (notification._id.toString() === notificationId);
            });
            if (!removedNotification)
                throw new Error(`notification [${notificationId}] not found in the transaction.`);
            // イベント作成
            const event = transactionEvent_1.default.createNotificationRemove({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                notification: removedNotification,
            });
            // 永続化
            const option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(transactionId),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    pushAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            // イベント作成
            const event = transactionEvent_1.default.createAuthorize({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                authorization: args.authorization,
            });
            // 永続化
            const option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionServiceInterpreter;
