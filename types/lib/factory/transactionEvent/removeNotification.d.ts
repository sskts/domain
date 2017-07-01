import * as Notification from '../notification';
import * as TransactionEventFactory from '../transactionEvent';
/**
 * 通知削除取引イベント
 *
 * @interface TransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {T} notification
 * @memberof tobereplaced$
 */
export interface ITransactionEvent<T extends Notification.INotification> extends TransactionEventFactory.ITransactionEvent {
    notification: T;
}
/**
 *
 * @memberof tobereplaced$
 */
export declare function create<T extends Notification.INotification>(args: {
    id?: string;
    transaction: string;
    occurred_at: Date;
    notification: T;
}): ITransactionEvent<T>;
