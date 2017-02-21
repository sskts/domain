import Authorization from './authorization';
import Notification from './notification';
import ObjectId from './objectId';
import TransactionEventGroup from './transactionEventGroup';
/**
 * 取引イベント
 *
 * @class TransactionEvent
 *
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {TransactionEventGroup} group 取引イベントグループ
 * @param {Date} occurred_at 発生日時
 */
declare class TransactionEvent {
    readonly _id: ObjectId;
    readonly transaction: ObjectId;
    readonly group: TransactionEventGroup;
    readonly occurred_at: Date;
    constructor(_id: ObjectId, transaction: ObjectId, group: TransactionEventGroup, occurred_at: Date);
}
declare namespace TransactionEvent {
    /**
     * オーソリ追加取引イベント
     *
     * @class AuthorizeTransactionEvent
     * @extends {TransactionEvent}
     * @param {ObjectId} _id
     * @param {ObjectId} transaction 取引ID
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     */
    class AuthorizeTransactionEvent extends TransactionEvent {
        readonly _id: ObjectId;
        readonly transaction: ObjectId;
        readonly occurred_at: Date;
        readonly authorization: Authorization;
        constructor(_id: ObjectId, transaction: ObjectId, occurred_at: Date, authorization: Authorization);
    }
    /**
     * オーソリ削除取引イベント
     *
     *
     * @class Unauthorize
     * @extends {TransactionEvent}
     * @param {ObjectId} _id
     * @param {ObjectId} transaction 取引ID
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     */
    class UnauthorizeTransactionEvent extends TransactionEvent {
        readonly _id: ObjectId;
        readonly transaction: ObjectId;
        readonly occurred_at: Date;
        readonly authorization: Authorization;
        constructor(_id: ObjectId, transaction: ObjectId, occurred_at: Date, authorization: Authorization);
    }
    /**
     * 通知追加取引イベント
     *
     *
     * @class NotificationAddTransactionEvent
     * @extends {TransactionEvent}
     * @template T
     *
     * @param {ObjectId} _id
     * @param {ObjectId} transaction 取引ID
     * @param {Date} occurred_at
     * @param {T} notification
     */
    class NotificationAddTransactionEvent<T extends Notification> extends TransactionEvent {
        readonly _id: ObjectId;
        readonly transaction: ObjectId;
        readonly occurred_at: Date;
        readonly notification: T;
        constructor(_id: ObjectId, transaction: ObjectId, occurred_at: Date, notification: T);
    }
    /**
     * 通知削除取引イベント
     *
     *
     * @class NotificationRemoveTransactionEvent
     * @extends {TransactionEvent}
     * @template T
     *
     * @param {ObjectId} _id
     * @param {ObjectId} transaction 取引ID
     * @param {Date} occurred_at
     * @param {T} notification
     */
    class NotificationRemoveTransactionEvent<T extends Notification> extends TransactionEvent {
        readonly _id: ObjectId;
        readonly transaction: ObjectId;
        readonly occurred_at: Date;
        readonly notification: T;
        constructor(_id: ObjectId, transaction: ObjectId, occurred_at: Date, notification: T);
    }
    function createAuthorize(args: {
        _id: ObjectId;
        transaction: ObjectId;
        occurred_at: Date;
        authorization: Authorization;
    }): AuthorizeTransactionEvent;
    function createUnauthorize(args: {
        _id: ObjectId;
        transaction: ObjectId;
        occurred_at: Date;
        authorization: Authorization;
    }): UnauthorizeTransactionEvent;
    function createNotificationAdd<T extends Notification>(args: {
        _id: ObjectId;
        transaction: ObjectId;
        occurred_at: Date;
        notification: T;
    }): NotificationAddTransactionEvent<T>;
    function createNotificationRemove<T extends Notification>(args: {
        _id: ObjectId;
        transaction: ObjectId;
        occurred_at: Date;
        notification: T;
    }): NotificationRemoveTransactionEvent<T>;
}
export default TransactionEvent;
