"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * オーソリ追加取引イベントファクトリー
 *
 * @namespace AuthorizeTransactionEventFactory
 */
const validator = require("validator");
const objectId_1 = require("../objectId");
const transactionEventGroup_1 = require("../transactionEventGroup");
function create(args) {
    if (validator.isEmpty(args.transaction))
        throw new Error('transaction required.');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: transactionEventGroup_1.default.AUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
exports.create = create;
