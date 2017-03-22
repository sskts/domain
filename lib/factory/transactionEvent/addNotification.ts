/**
 * 通知追加取引イベントファクトリー
 *
 * @namespace AddNotificationTransactionEventFactory
 */
import * as Notification from '../notification';
import ObjectId from '../objectId';
import * as TransactionEventFactory from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

/**
 * 通知追加取引イベント
 *
 * @interface NotificationAddTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {T} notification
 */
export interface IAddNotificationTransactionEvent<T extends Notification.INotification> extends TransactionEventFactory.ITransactionEvent {
    notification: T;
}

export function create<T extends Notification.INotification>(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    notification: T
}): IAddNotificationTransactionEvent<T> {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: TransactionEventGroup.ADD_NOTIFICATION,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        notification: args.notification
    };
}
