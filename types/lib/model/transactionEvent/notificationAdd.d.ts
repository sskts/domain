/// <reference types="mongoose" />
import Notification from "../notification";
import ObjectId from "../objectId";
import TransactionEvent from "../transactionEvent";
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
    readonly _id: ObjectId;
    readonly occurred_at: Date;
    readonly notification: T;
    constructor(_id: ObjectId, occurred_at: Date, notification: T);
}
