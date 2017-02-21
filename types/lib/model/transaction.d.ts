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
declare class Transaction {
    readonly _id: ObjectId;
    readonly status: TransactionStatus;
    readonly owners: Owner[];
    readonly expired_at: Date;
    readonly inquiry_key: TransactionInquiryKey | null;
    readonly queues_status: TransactionQueuesStatus;
    constructor(_id: ObjectId, status: TransactionStatus, owners: Owner[], expired_at: Date, inquiry_key: TransactionInquiryKey | null, queues_status: TransactionQueuesStatus);
    /**
     * 照会可能かどうか
     *
     * @returns {boolean}
     *
     * @memberOf Transaction
     */
    isInquiryAvailable(): TransactionInquiryKey | null;
}
declare namespace Transaction {
    interface ITransaction {
        _id?: ObjectId;
        status: TransactionStatus;
        owners: Owner[];
        expired_at: Date;
        inquiry_key?: TransactionInquiryKey;
        queues_status?: TransactionQueuesStatus;
    }
    function create(args: ITransaction): Transaction;
}
export default Transaction;
