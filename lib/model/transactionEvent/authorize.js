"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
/**
 * オーソリ追加取引イベント
 *
 *
 * @class AuthorizeTransactionEvent
 * @extends {TransactionEvent}
 */
class AuthorizeTransactionEvent extends transactionEvent_1.default {
    /**
     * Creates an instance of AuthorizeTransactionEvent.
     *
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     *
     * @memberOf AuthorizeTransactionEvent
     */
    constructor(_id, occurred_at, authorization) {
        super(_id, transactionEventGroup_1.default.AUTHORIZE, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.authorization = authorization;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthorizeTransactionEvent;
