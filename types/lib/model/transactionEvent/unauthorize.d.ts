/// <reference types="mongoose" />
import Authorization from "../authorization";
import ObjectId from "../objectId";
import TransactionEvent from "../transactionEvent";
/**
 * オーソリ削除取引イベント
 *
 *
 * @class Unauthorize
 * @extends {TransactionEvent}
 */
export default class Unauthorize extends TransactionEvent {
    readonly _id: ObjectId;
    readonly occurred_at: Date;
    readonly authorization: Authorization;
    /**
     * Creates an instance of Unauthorize.
     *
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     *
     * @memberOf Unauthorize
     */
    constructor(_id: ObjectId, occurred_at: Date, authorization: Authorization);
}
