
/**
 * 通知削除取引イベントファクトリー
 *
 * @namespace factory/transactionEvent/removeNotification
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as Notification from '../notification';
import ObjectId from '../objectId';
import * as TransactionEventFactory from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

/**
 * 通知削除取引イベント
 *
 * @interface RemoveNotificationTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {T} notification
 * @memberof tobereplaced$
 */
export interface IRemoveNotificationTransactionEvent<T extends Notification.INotification>
    extends TransactionEventFactory.ITransactionEvent {
    notification: T;
}

/**
 *
 * @memberof tobereplaced$
 */
export function create<T extends Notification.INotification>(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    notification: T
}): IRemoveNotificationTransactionEvent<T> {
    if (_.isEmpty(args.transaction)) throw new ArgumentNullError('transaction');
    if (_.isEmpty(args.notification)) throw new ArgumentNullError('notification');
    if (!_.isDate(args.occurred_at)) throw new ArgumentError('occurred_at', 'occurred_at should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: TransactionEventGroup.REMOVE_NOTIFICATION,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        notification: args.notification
    };
}
