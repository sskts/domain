"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引ファクトリー
 *
 * @namespace TransactionFacroty
 *
 * @param {string} id
 * @param {TransactionStatus} status
 * @param {Owner[]} owners
 * @param {Date} expired_at
 * @param {string} inquiry_theater
 * @param {string} inquiry_id
 * @param {string} inquiry_pass
 * @param {TransactionQueuesStatus} queues_status
 */
const objectId_1 = require("./objectId");
const transactionQueuesStatus_1 = require("./transactionQueuesStatus");
function create(args) {
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : (args.id),
        status: args.status,
        owners: args.owners,
        expired_at: args.expired_at,
        inquiry_key: (args.inquiry_key === undefined) ? null : (args.inquiry_key),
        queues_status: (args.queues_status === undefined) ? transactionQueuesStatus_1.default.UNEXPORTED : (args.queues_status)
    };
}
exports.create = create;
