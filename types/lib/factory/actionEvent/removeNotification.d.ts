import * as ActionEventFactory from '../actionEvent';
import * as Notification from '../notification';
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
