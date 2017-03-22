/**
 * プッシュ通知キューファクトリー
 *
 * @namespace PushNotificationQueueFacroty
 */
import * as Notification from '../../factory/notification';
import * as Queue from '../../factory/queue';
import ObjectId from '../objectId';
import QueueGroup from '../queueGroup';
import QueueStatus from '../queueStatus';

/**
 * プッシュ通知キュー
 *
 * @param {T} notification
 */
export interface IPushNotificationQueue<T extends Notification.INotification> extends Queue.IQueue {
    notification: T;
}

export function create<T extends Notification.INotification>(args: {
    id?: string,
    notification: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: string[]
}): IPushNotificationQueue<T> {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: QueueGroup.PUSH_NOTIFICATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        notification: args.notification
    };
}
