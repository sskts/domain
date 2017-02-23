import Authorization from './authorization';
import Notification from './notification';
import TransactionEventGroup from './transactionEventGroup';
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
declare class TransactionEvent {
    readonly id: string;
    readonly transaction: string;
    readonly group: TransactionEventGroup;
    readonly occurred_at: Date;
    constructor(id: string, transaction: string, group: TransactionEventGroup, occurred_at: Date);
}
declare namespace TransactionEvent {
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
    class AuthorizeTransactionEvent extends TransactionEvent {
        readonly id: string;
        readonly transaction: string;
        readonly occurred_at: Date;
        readonly authorization: Authorization;
        constructor(id: string, transaction: string, occurred_at: Date, authorization: Authorization);
    }
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
    class UnauthorizeTransactionEvent extends TransactionEvent {
        readonly id: string;
        readonly transaction: string;
        readonly occurred_at: Date;
        readonly authorization: Authorization;
        constructor(id: string, transaction: string, occurred_at: Date, authorization: Authorization);
    }
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
    class NotificationAddTransactionEvent<T extends Notification> extends TransactionEvent {
        readonly id: string;
        readonly transaction: string;
        readonly occurred_at: Date;
        readonly notification: T;
        constructor(id: string, transaction: string, occurred_at: Date, notification: T);
    }
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
    class NotificationRemoveTransactionEvent<T extends Notification> extends TransactionEvent {
        readonly id: string;
        readonly transaction: string;
        readonly occurred_at: Date;
        readonly notification: T;
        constructor(id: string, transaction: string, occurred_at: Date, notification: T);
    }
    function createAuthorize(args: {
        id: string;
        transaction: string;
        occurred_at: Date;
        authorization: Authorization;
    }): AuthorizeTransactionEvent;
    function createUnauthorize(args: {
        id: string;
        transaction: string;
        occurred_at: Date;
        authorization: Authorization;
    }): UnauthorizeTransactionEvent;
    function createNotificationAdd<T extends Notification>(args: {
        id: string;
        transaction: string;
        occurred_at: Date;
        notification: T;
    }): NotificationAddTransactionEvent<T>;
    function createNotificationRemove<T extends Notification>(args: {
        id: string;
        transaction: string;
        occurred_at: Date;
        notification: T;
    }): NotificationRemoveTransactionEvent<T>;
}
export default TransactionEvent;
