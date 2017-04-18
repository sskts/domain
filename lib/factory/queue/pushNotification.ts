/**
 * プッシュ通知キューファクトリー
 *
 * @namespace factory/queue/pushNotification
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as Notification from '../../factory/notification';
import * as QueueFactory from '../../factory/queue';
import ObjectId from '../objectId';
import QueueGroup from '../queueGroup';
import QueueStatus from '../queueStatus';

/**
 * プッシュ通知キュー
 *
 * @param {T} notification
 * @memberof tobereplaced$
 */
export interface IPushNotificationQueue<T extends Notification.INotification> extends QueueFactory.IQueue {
    notification: T;
}

/**
 *
 * @memberof tobereplaced$
 */
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
    if (_.isEmpty(args.notification)) throw new ArgumentNullError('notification');
    if (_.isEmpty(args.status)) throw new ArgumentNullError('status');
    if (!_.isDate(args.run_at)) throw new ArgumentError('run_at', 'run_at should be Date');
    if (!_.isNumber(args.max_count_try)) throw new ArgumentError('max_count_try', 'max_count_try should be number');
    if (!_.isNull(args.last_tried_at) && !_.isDate(args.last_tried_at)) {
        throw new ArgumentError('last_tried_at', 'last_tried_at should be Date or null');
    }
    if (!_.isNumber(args.count_tried)) throw new ArgumentError('count_tried', 'count_tried should be number');
    if (!_.isArray(args.results)) throw new ArgumentError('results', 'results should be array');

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
