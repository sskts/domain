"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
/**
 * オーソリ削除取引イベント
 *
 *
 * @class Unauthorize
 * @extends {TransactionEvent}
 */
class Unauthorize extends transactionEvent_1.default {
    /**
     * Creates an instance of Unauthorize.
     *
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {Authorization} authorization
     *
     * @memberOf Unauthorize
     */
    constructor(_id, occurred_at, authorization) {
        super(_id, transactionEventGroup_1.default.UNAUTHORIZE, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.authorization = authorization;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Unauthorize;
