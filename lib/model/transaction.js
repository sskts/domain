"use strict";
// tslint:disable:variable-name
const objectId_1 = require("./objectId");
const transactionQueuesStatus_1 = require("./transactionQueuesStatus");
/**
 * 取引
 *
 * @class Transaction
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
class Transaction {
    constructor(id, status, owners, expired_at, inquiry_key, queues_status) {
        this.id = id;
        this.status = status;
        this.owners = owners;
        this.expired_at = expired_at;
        this.inquiry_key = inquiry_key;
        this.queues_status = queues_status;
        // todo validation
    }
    toDocument() {
        return {
            id: this.id,
            status: this.status,
            owners: this.owners.map((owner) => owner.id),
            expired_at: this.expired_at,
            inquiry_key: this.inquiry_key,
            queues_status: this.queues_status
        };
    }
    /**
     * 照会可能かどうか
     *
     * @returns {boolean}
     *
     * @memberOf Transaction
     */
    isInquiryAvailable() {
        return (this.inquiry_key);
    }
}
(function (Transaction) {
    function create(args) {
        return new Transaction((args.id === undefined) ? objectId_1.default().toString() : (args.id), args.status, args.owners, args.expired_at, (args.inquiry_key === undefined) ? null : (args.inquiry_key), (args.queues_status === undefined) ? transactionQueuesStatus_1.default.UNEXPORTED : (args.queues_status));
    }
    Transaction.create = create;
})(Transaction || (Transaction = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
