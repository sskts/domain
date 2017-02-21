"use strict";
/**
 * 取引イベント
 *
 * @class TransactionEvent
 *
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {TransactionEventGroup} group 取引イベントグループ
 * @param {Date} occurred_at 発生日時
 */
class TransactionEvent {
    constructor(_id, transaction, group, occurred_at) {
        this._id = _id;
        this.transaction = transaction;
        this.group = group;
        this.occurred_at = occurred_at;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEvent;
