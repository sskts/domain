
/**
 * 通知削除取引イベントファクトリー
 *
 * @namespace factory/transactionEvent/removeNotification
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as ActionEventFactory from '../actionEvent';
import ActionEventType from '../actionEventType';
import * as Notification from '../notification';
import ObjectId from '../objectId';

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
export function create<T extends Notification.INotification>(args: {
    id?: string,
    occurredAt: Date,
    notification: T
}): IActionEvent<T> {
    if (_.isEmpty(args.notification)) throw new ArgumentNullError('notification');
    if (!_.isDate(args.occurredAt)) throw new ArgumentError('occurredAt', 'occurredAt should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        actionEventType: ActionEventType.RemoveNotification,
        occurredAt: args.occurredAt,
        notification: args.notification
    };
}
