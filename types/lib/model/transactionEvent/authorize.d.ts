/// <reference types="mongoose" />
import Authorization from '../authorization';
import ObjectId from '../objectId';
import TransactionEvent from '../transactionEvent';
/**
 * オーソリ追加取引イベント
 *
 *
 * @class AuthorizeTransactionEvent
 * @extends {TransactionEvent}
 */
export default class AuthorizeTransactionEvent extends TransactionEvent {
    readonly _id: ObjectId;
    readonly occurred_at: Date;
    readonly authorization: Authorization;
    /**
     * Creates an instance of AuthorizeTransactionEvent.
     *
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     *
     * @memberOf AuthorizeTransactionEvent
     */
    constructor(_id: ObjectId, occurred_at: Date, authorization: Authorization);
}
