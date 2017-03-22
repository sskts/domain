/**
 * 通知追加取引イベントファクトリー
 *
 * @namespace AddNotificationTransactionEventFactory
 */
import * as Notification from '../notification';
import * as TransactionEventFactory from '../transactionEvent';
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
export declare function create<T extends Notification.INotification>(args: {
    id?: string;
    transaction: string;
    occurred_at: Date;
    notification: T;
}): IAddNotificationTransactionEvent<T>;
