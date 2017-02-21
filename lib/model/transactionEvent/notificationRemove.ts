// tslint:disable:variable-name
import Notification from '../notification';
import ObjectId from '../objectId';
import TransactionEvent from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

/**
 * 通知削除取引イベント
 *
 *
 * @class NotificationRemoveTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {Date} occurred_at
 * @param {T} notification
 */
export default class NotificationRemoveTransactionEvent<T extends Notification> extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly transaction: ObjectId,
        readonly occurred_at: Date,
        readonly notification: T
    ) {
        super(_id, transaction, TransactionEventGroup.NOTIFICATION_REMOVE, occurred_at);

        // todo validation
    }
}
