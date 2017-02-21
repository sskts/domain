/// <reference types="mongoose" />
import Authorization from '../authorization';
import ObjectId from '../objectId';
import TransactionEvent from '../transactionEvent';
/**
 * オーソリ追加取引イベント
 *
 * @class AuthorizeTransactionEvent
 * @extends {TransactionEvent}
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {Date} occurred_at
 * @param {Authorization} authorization
 */
export default class AuthorizeTransactionEvent extends TransactionEvent {
    readonly _id: ObjectId;
    readonly transaction: ObjectId;
    readonly occurred_at: Date;
    readonly authorization: Authorization;
    constructor(_id: ObjectId, transaction: ObjectId, occurred_at: Date, authorization: Authorization);
}
