/// <reference types="mongoose" />
import ObjectId from "./objectId";
import TransactionEventGroup from "./transactionEventGroup";
/**
 * 取引イベント
 *
 * @export
 * @class TransactionEvent
 */
export default class TransactionEvent {
    readonly _id: ObjectId;
    readonly group: TransactionEventGroup;
    readonly occurred_at: Date;
    /**
     * Creates an instance of TransactionEvent.
     *
     * @param {ObjectId} _id
     * @param {TransactionEventGroup} group 取引イベントグループ
     * @param {Date} occurred_at 発生日時
     *
     * @memberOf TransactionEvent
     */
    constructor(_id: ObjectId, group: TransactionEventGroup, occurred_at: Date);
}
