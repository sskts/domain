/**
 * 通知削除取引イベントファクトリー
 *
 * @namespace RemoveNotificationTransactionEventFactory
 */
import * as Notification from '../notification';
import * as TransactionEventFactory from '../transactionEvent';
/**
 * 通知削除取引イベント
 *
 * @interface RemoveNotificationTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {T} notification
 */
export interface IRemoveNotificationTransactionEvent<T extends Notification.INotification> extends TransactionEventFactory.ITransactionEvent {
    notification: T;
}
export declare function create<T extends Notification.INotification>(args: {
    id?: string;
    transaction: string;
    occurred_at: Date;
    notification: T;
}): IRemoveNotificationTransactionEvent<T>;
