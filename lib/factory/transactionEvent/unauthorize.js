"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * オーソリ削除取引イベントファクトリー
 *
 * @namespace UnauthorizeTransactionEventFactory
 */
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const objectId_1 = require("../objectId");
const transactionEventGroup_1 = require("../transactionEventGroup");
function create(args) {
    if (validator.isEmpty(args.occurred_at.toString()))
        throw new argumentNull_1.default('occurred_at');
    if (!(args.occurred_at instanceof Date))
        throw new argument_1.default('occurred_at should be Date');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: transactionEventGroup_1.default.UNAUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
exports.create = create;
