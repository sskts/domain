import Notification from '../notification';
import ObjectId from '../objectId';
import TransactionEvent from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

/**
 * 通知追加取引イベント
 *
 *
 * @class NotificationAddTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {ObjectId} _id
 * @param {Date} occurred_at
 * @param {T} notification
 */
export default class NotificationAddTransactionEvent<T extends Notification> extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly occurred_at: Date,
        readonly notification: T
    ) {
        super(_id, TransactionEventGroup.NOTIFICATION_ADD, occurred_at);

        // todo validation
    }
}
