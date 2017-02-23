"use strict";
const transactionEventGroup_1 = require("./transactionEventGroup");
/**
 * 取引イベント
 *
 * @class TransactionEvent
 *
 * @param {string} id
 * @param {string} transaction 取引ID
 * @param {TransactionEventGroup} group 取引イベントグループ
 * @param {Date} occurred_at 発生日時
 */
class TransactionEvent {
    constructor(id, transaction, group, occurred_at) {
        this.id = id;
        this.transaction = transaction;
        this.group = group;
        this.occurred_at = occurred_at;
        // todo validation
    }
}
(function (TransactionEvent) {
    /**
     * オーソリ追加取引イベント
     *
     * @class AuthorizeTransactionEvent
     * @extends {TransactionEvent}
     * @param {string} id
     * @param {string} transaction 取引ID
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     */
    // tslint:disable-next-line:max-classes-per-file
    class AuthorizeTransactionEvent extends TransactionEvent {
        constructor(id, transaction, occurred_at, authorization) {
            super(id, transaction, transactionEventGroup_1.default.AUTHORIZE, occurred_at);
            this.id = id;
            this.transaction = transaction;
            this.occurred_at = occurred_at;
            this.authorization = authorization;
            // todo validation
        }
    }
    TransactionEvent.AuthorizeTransactionEvent = AuthorizeTransactionEvent;
    /**
     * オーソリ削除取引イベント
     *
     *
     * @class Unauthorize
     * @extends {TransactionEvent}
     * @param {string} id
     * @param {string} transaction 取引ID
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     */
    // tslint:disable-next-line:max-classes-per-file
    class UnauthorizeTransactionEvent extends TransactionEvent {
        constructor(id, transaction, occurred_at, authorization) {
            super(id, transaction, transactionEventGroup_1.default.UNAUTHORIZE, occurred_at);
            this.id = id;
            this.transaction = transaction;
            this.occurred_at = occurred_at;
            this.authorization = authorization;
            // todo validation
        }
    }
    TransactionEvent.UnauthorizeTransactionEvent = UnauthorizeTransactionEvent;
    /**
     * 通知追加取引イベント
     *
     *
     * @class NotificationAddTransactionEvent
     * @extends {TransactionEvent}
     * @template T
     *
     * @param {string} id
     * @param {string} transaction 取引ID
     * @param {Date} occurred_at
     * @param {T} notification
     */
    // tslint:disable-next-line:max-classes-per-file
    class NotificationAddTransactionEvent extends TransactionEvent {
        constructor(id, transaction, occurred_at, notification) {
            super(id, transaction, transactionEventGroup_1.default.NOTIFICATION_ADD, occurred_at);
            this.id = id;
            this.transaction = transaction;
            this.occurred_at = occurred_at;
            this.notification = notification;
            // todo validation
        }
    }
    TransactionEvent.NotificationAddTransactionEvent = NotificationAddTransactionEvent;
    /**
     * 通知削除取引イベント
     *
     *
     * @class NotificationRemoveTransactionEvent
     * @extends {TransactionEvent}
     * @template T
     *
     * @param {string} id
     * @param {string} transaction 取引ID
     * @param {Date} occurred_at
     * @param {T} notification
     */
    // tslint:disable-next-line:max-classes-per-file
    class NotificationRemoveTransactionEvent extends TransactionEvent {
        constructor(id, transaction, occurred_at, notification) {
            super(id, transaction, transactionEventGroup_1.default.NOTIFICATION_REMOVE, occurred_at);
            this.id = id;
            this.transaction = transaction;
            this.occurred_at = occurred_at;
            this.notification = notification;
            // todo validation
        }
    }
    TransactionEvent.NotificationRemoveTransactionEvent = NotificationRemoveTransactionEvent;
    function createAuthorize(args) {
        return new AuthorizeTransactionEvent(args.id, args.transaction, args.occurred_at, args.authorization);
    }
    TransactionEvent.createAuthorize = createAuthorize;
    function createUnauthorize(args) {
        return new UnauthorizeTransactionEvent(args.id, args.transaction, args.occurred_at, args.authorization);
    }
    TransactionEvent.createUnauthorize = createUnauthorize;
    function createNotificationAdd(args) {
        return new NotificationAddTransactionEvent(args.id, args.transaction, args.occurred_at, args.notification);
    }
    TransactionEvent.createNotificationAdd = createNotificationAdd;
    function createNotificationRemove(args) {
        return new NotificationRemoveTransactionEvent(args.id, args.transaction, args.occurred_at, args.notification);
    }
    TransactionEvent.createNotificationRemove = createNotificationRemove;
})(TransactionEvent || (TransactionEvent = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEvent;
