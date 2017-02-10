"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
/**
 * 通知追加取引イベント
 *
 * @export
 * @class NotificationAddTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 */
class NotificationAddTransactionEvent extends transactionEvent_1.default {
    /**
     * Creates an instance of NotificationAddTransactionEvent.
     *
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {T} notification
     *
     * @memberOf NotificationAddTransactionEvent
     */
    constructor(_id, occurred_at, notification) {
        super(_id, transactionEventGroup_1.default.NOTIFICATION_ADD, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.notification = notification;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationAddTransactionEvent;
