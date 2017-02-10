/// <reference types="mongoose" />
import Notification from "../notification";
import ObjectId from "../objectId";
import TransactionEvent from "../transactionEvent";
/**
 * 通知削除取引イベント
 *
 * @export
 * @class NotificationRemoveTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 */
export default class NotificationRemoveTransactionEvent<T extends Notification> extends TransactionEvent {
    readonly _id: ObjectId;
    readonly occurred_at: Date;
    readonly notification: T;
    /**
     * Creates an instance of NotificationRemoveTransactionEvent.
     *
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {T} notification
     *
     * @memberOf NotificationRemoveTransactionEvent
     */
    constructor(_id: ObjectId, occurred_at: Date, notification: T);
}
