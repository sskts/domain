/**
 * 取引ファクトリー
 *
 * @namespace TransactionFactory
 */
"use strict";
const objectId_1 = require("../model/objectId");
const transaction_1 = require("../model/transaction");
const transactionQueuesStatus_1 = require("../model/transactionQueuesStatus");
function create(args) {
    return new transaction_1.default((args._id === undefined) ? objectId_1.default() : (args._id), args.status, (args.events === undefined) ? [] : (args.events), args.owners, (args.queues === undefined) ? [] : (args.queues), args.expired_at, (args.inquiry_key === undefined) ? null : (args.inquiry_key), (args.queues_status === undefined) ? transactionQueuesStatus_1.default.UNEXPORTED : (args.queues_status));
}
exports.create = create;
