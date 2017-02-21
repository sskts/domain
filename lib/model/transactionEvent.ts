// tslint:disable:variable-name
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
class TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly transaction: ObjectId,
        readonly group: TransactionEventGroup,
        readonly occurred_at: Date
    ) {
        // todo validation
    }
}

namespace TransactionEvent {
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
    // tslint:disable-next-line:max-classes-per-file
    export class AuthorizeTransactionEvent extends TransactionEvent {
        constructor(
            readonly _id: ObjectId,
            readonly transaction: ObjectId,
            readonly occurred_at: Date,
            readonly authorization: Authorization
        ) {
            super(_id, transaction, TransactionEventGroup.AUTHORIZE, occurred_at);

            // todo validation
        }
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
    // tslint:disable-next-line:max-classes-per-file
    export class UnauthorizeTransactionEvent extends TransactionEvent {
        constructor(
            readonly _id: ObjectId,
            readonly transaction: ObjectId,
            readonly occurred_at: Date,
            readonly authorization: Authorization
        ) {
            super(_id, transaction, TransactionEventGroup.UNAUTHORIZE, occurred_at);

            // todo validation
        }
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
    // tslint:disable-next-line:max-classes-per-file
    export class NotificationAddTransactionEvent<T extends Notification> extends TransactionEvent {
        constructor(
            readonly _id: ObjectId,
            readonly transaction: ObjectId,
            readonly occurred_at: Date,
            readonly notification: T
        ) {
            super(_id, transaction, TransactionEventGroup.NOTIFICATION_ADD, occurred_at);

            // todo validation
        }
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
    // tslint:disable-next-line:max-classes-per-file
    export class NotificationRemoveTransactionEvent<T extends Notification> extends TransactionEvent {
        constructor(
            readonly _id: ObjectId,
            readonly transaction: ObjectId,
            readonly occurred_at: Date,
            readonly notification: T
        ) {
            super(_id, transaction, TransactionEventGroup.NOTIFICATION_REMOVE, occurred_at);

            // todo validation
        }
    }

    export function createAuthorize(args: {
        _id: ObjectId,
        transaction: ObjectId,
        occurred_at: Date,
        authorization: Authorization
    }) {
        return new AuthorizeTransactionEvent(
            args._id,
            args.transaction,
            args.occurred_at,
            args.authorization
        );
    }

    export function createUnauthorize(args: {
        _id: ObjectId,
        transaction: ObjectId,
        occurred_at: Date,
        authorization: Authorization
    }) {
        return new UnauthorizeTransactionEvent(
            args._id,
            args.transaction,
            args.occurred_at,
            args.authorization
        );
    }

    export function createNotificationAdd<T extends Notification>(args: {
        _id: ObjectId,
        transaction: ObjectId,
        occurred_at: Date,
        notification: T
    }) {
        return new NotificationAddTransactionEvent<T>(
            args._id,
            args.transaction,
            args.occurred_at,
            args.notification
        );
    }

    export function createNotificationRemove<T extends Notification>(args: {
        _id: ObjectId,
        transaction: ObjectId,
        occurred_at: Date,
        notification: T
    }) {
        return new NotificationRemoveTransactionEvent<T>(
            args._id,
            args.transaction,
            args.occurred_at,
            args.notification
        );
    }
}

export default TransactionEvent;
