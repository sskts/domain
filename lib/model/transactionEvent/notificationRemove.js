"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
/**
 * 通知削除取引イベント
 *
 * @export
 * @class NotificationRemoveTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 */
class NotificationRemoveTransactionEvent extends transactionEvent_1.default {
    /**
     * Creates an instance of NotificationRemoveTransactionEvent.
     *
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {T} notification
     *
     * @memberOf NotificationRemoveTransactionEvent
     */
    constructor(_id, occurred_at, notification) {
        super(_id, transactionEventGroup_1.default.NOTIFICATION_REMOVE, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.notification = notification;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationRemoveTransactionEvent;
