/// <reference types="mongoose" />
import Notification from '../notification';
import ObjectId from '../objectId';
import TransactionEvent from '../transactionEvent';
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
    readonly _id: ObjectId;
    readonly transaction: ObjectId;
    readonly occurred_at: Date;
    readonly notification: T;
    constructor(_id: ObjectId, transaction: ObjectId, occurred_at: Date, notification: T);
}
