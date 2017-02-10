"use strict";
/**
 * 取引イベント
 *
 * @class TransactionEvent
 *
 * @param {ObjectId} _id
 * @param {TransactionEventGroup} group 取引イベントグループ
 * @param {Date} occurred_at 発生日時
 */
class TransactionEvent {
    constructor(_id, group, occurred_at) {
        this._id = _id;
        this.group = group;
        this.occurred_at = occurred_at;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEvent;
