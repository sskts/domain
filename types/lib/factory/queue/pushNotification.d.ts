/**
 * プッシュ通知キューファクトリー
 *
 * @namespace PushNotificationQueueFacroty
 */
import * as Notification from '../../factory/notification';
import * as Queue from '../../factory/queue';
import QueueStatus from '../queueStatus';
/**
 * プッシュ通知キュー
 *
 * @param {T} notification
 */
export interface IPushNotificationQueue<T extends Notification.INotification> extends Queue.IQueue {
    notification: T;
}
export declare function create<T extends Notification.INotification>(args: {
    id?: string;
    notification: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): IPushNotificationQueue<T>;
