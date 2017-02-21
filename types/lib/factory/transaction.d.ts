/// <reference types="mongoose" />
/**
 * 取引ファクトリー
 *
 * @namespace TransactionFactory
 */
import ObjectId from '../model/objectId';
import Owner from '../model/owner';
import Transaction from '../model/transaction';
import TransactionInquiryKey from '../model/transactionInquiryKey';
import TransactionQueuesStatus from '../model/transactionQueuesStatus';
import TransactionStatus from '../model/transactionStatus';
export declare function create(args: {
    _id?: ObjectId;
    status: TransactionStatus;
    owners: Owner[];
    expired_at: Date;
    inquiry_key?: TransactionInquiryKey;
    queues_status?: TransactionQueuesStatus;
}): Transaction;
