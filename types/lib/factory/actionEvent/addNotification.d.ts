import * as ActionEventFactory from '../actionEvent';
import * as Notification from '../notification';
/**
 * 通知追加取引イベント
 *
 * @interface NotificationAddTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {T} notification
 * @memberof tobereplaced$
 */
export interface IActionEvent<T extends Notification.INotification> extends ActionEventFactory.IActionEvent {
    notification: T;
}
/**
 *
 * @memberof tobereplaced$
 */
export declare function create<T extends Notification.INotification>(args: {
    id?: string;
    occurredAt: Date;
    notification: T;
}): IActionEvent<T>;
