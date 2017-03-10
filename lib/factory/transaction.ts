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
import ObjectId from './objectId';
import * as Owner from './owner';
import * as TransactionInquiryKey from './transactionInquiryKey';
import TransactionQueuesStatus from './transactionQueuesStatus';
import TransactionStatus from './transactionStatus';

export interface ITransaction {
    id: string;
    status: TransactionStatus;
    owners: Owner.IOwner[];
    expired_at: Date;
    inquiry_key: TransactionInquiryKey.ITransactionInquiryKey | null;
    queues_status: TransactionQueuesStatus;
}

export function create(args: {
    id?: string;
    status: TransactionStatus;
    owners: Owner.IOwner[];
    expired_at: Date;
    inquiry_key?: TransactionInquiryKey.ITransactionInquiryKey;
    queues_status?: TransactionQueuesStatus;
}): ITransaction {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : (args.id),
        status: args.status,
        owners: args.owners,
        expired_at: args.expired_at,
        inquiry_key: (args.inquiry_key === undefined) ? null : (args.inquiry_key),
        queues_status: (args.queues_status === undefined) ? TransactionQueuesStatus.UNEXPORTED : (args.queues_status)
    };
}
