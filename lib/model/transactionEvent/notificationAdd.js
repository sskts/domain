"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
/**
 * 通知追加取引イベント
 *
 *
 * @class NotificationAddTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 *
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {Date} occurred_at
 * @param {T} notification
 */
class NotificationAddTransactionEvent extends transactionEvent_1.default {
    constructor(_id, transaction, occurred_at, notification) {
        super(_id, transaction, transactionEventGroup_1.default.NOTIFICATION_ADD, occurred_at);
        this._id = _id;
        this.transaction = transaction;
        this.occurred_at = occurred_at;
        this.notification = notification;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationAddTransactionEvent;
