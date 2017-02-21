"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
/**
 * オーソリ削除取引イベント
 *
 *
 * @class Unauthorize
 * @extends {TransactionEvent}
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {Date} occurred_at
 * @param {Authorization} authorization
 */
class Unauthorize extends transactionEvent_1.default {
    constructor(_id, transaction, occurred_at, authorization) {
        super(_id, transaction, transactionEventGroup_1.default.UNAUTHORIZE, occurred_at);
        this._id = _id;
        this.transaction = transaction;
        this.occurred_at = occurred_at;
        this.authorization = authorization;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Unauthorize;
