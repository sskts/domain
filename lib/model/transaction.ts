// tslint:disable:variable-name
import ObjectId from './objectId';
import Owner from './owner';
import TransactionInquiryKey from './transactionInquiryKey';
import TransactionQueuesStatus from './transactionQueuesStatus';
import TransactionStatus from './transactionStatus';

/**
 * 取引
 *
 * @class Transaction
 *
 * @param {ObjectId} _id
 * @param {TransactionStatus} status
 * @param {Owner[]} owners
 * @param {Date} expired_at
 * @param {string} inquiry_theater
 * @param {string} inquiry_id
 * @param {string} inquiry_pass
 * @param {TransactionQueuesStatus} queues_status
 */
export default class Transaction {
    constructor(
        readonly _id: ObjectId,
        readonly status: TransactionStatus,
        readonly owners: Owner[],
        readonly expired_at: Date,
        readonly inquiry_key: TransactionInquiryKey | null,
        readonly queues_status: TransactionQueuesStatus
    ) {
        // todo validation
    }

    /**
     * 照会可能かどうか
     *
     * @returns {boolean}
     *
     * @memberOf Transaction
     */
    public isInquiryAvailable() {
        return (this.inquiry_key);
    }
}
