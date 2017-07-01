import * as Notification from '../../factory/notification';
import * as QueueFactory from '../../factory/queue';
import QueueStatus from '../queueStatus';
/**
 * プッシュ通知キュー
 *
 * @param {T} notification
 * @memberof tobereplaced$
 */
export interface IQueue<T extends Notification.INotification> extends QueueFactory.IQueue {
    notification: T;
}
/**
 *
 * @memberof tobereplaced$
 */
export declare function create<T extends Notification.INotification>(args: {
    id?: string;
    notification: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): IQueue<T>;
