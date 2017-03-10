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
export declare function create(args: {
    id?: string;
    status: TransactionStatus;
    owners: Owner.IOwner[];
    expired_at: Date;
    inquiry_key?: TransactionInquiryKey.ITransactionInquiryKey;
    queues_status?: TransactionQueuesStatus;
}): ITransaction;
