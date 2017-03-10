/**
 * 取引イベントファクトリー
 *
 * @namespace TransactionEventFacroty
 */

import * as Authorization from './authorization';
import * as Notification from './notification';
import ObjectId from './objectId';
import TransactionEventGroup from './transactionEventGroup';

/**
 * 取引イベント
 *
 * @param {string} id
 * @param {string} transaction 取引ID
 * @param {TransactionEventGroup} group 取引イベントグループ
 * @param {Date} occurred_at 発生日時
 */
export interface ITransactionEvent {
    id: string;
    transaction: string;
    group: TransactionEventGroup;
    occurred_at: Date;
}

/**
 * オーソリ追加取引イベント
 *
 * @interface AuthorizeTransactionEvent
 * @extends {TransactionEvent}
 * @param {Authorization} authorization
 */
export interface IAuthorizeTransactionEvent extends ITransactionEvent {
    authorization: Authorization.IAuthorization;
}

/**
 * オーソリ削除取引イベント
 *
 *
 * @interface Unauthorize
 * @extends {TransactionEvent}
 * @param {Authorization} authorization
 */
export interface IUnauthorizeTransactionEvent extends ITransactionEvent {
    authorization: Authorization.IAuthorization;
}

/**
 * 通知追加取引イベント
 *
 * @interface NotificationAddTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {T} notification
 */
export interface INotificationAddTransactionEvent<T extends Notification.INotification> extends ITransactionEvent {
    notification: T;
}

/**
 * 通知削除取引イベント
 *
 * @interface NotificationRemoveTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {T} notification
 */
export interface INotificationRemoveTransactionEvent<T extends Notification.INotification> extends ITransactionEvent {
    notification: T;
}

export function createAuthorize(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    authorization: Authorization.IAuthorization
}): IAuthorizeTransactionEvent {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: TransactionEventGroup.AUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}

export function createUnauthorize(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    authorization: Authorization.IAuthorization
}): IUnauthorizeTransactionEvent {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: TransactionEventGroup.UNAUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}

export function createNotificationAdd<T extends Notification.INotification>(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    notification: T
}): INotificationAddTransactionEvent<T> {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: TransactionEventGroup.NOTIFICATION_ADD,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        notification: args.notification
    };
}

export function createNotificationRemove<T extends Notification.INotification>(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    notification: T
}): INotificationRemoveTransactionEvent<T> {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: TransactionEventGroup.NOTIFICATION_REMOVE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        notification: args.notification
    };
}
