import * as OwnerFactory from './owner';
import * as TransactionInquiryKeyFactory from './transactionInquiryKey';
import TransactionQueuesStatus from './transactionQueuesStatus';
import TransactionStatus from './transactionStatus';
export interface ITransaction {
    id: string;
    status: TransactionStatus;
    owners: OwnerFactory.IOwner[];
    expires_at: Date;
    inquiry_key: TransactionInquiryKeyFactory.ITransactionInquiryKey | undefined;
    queues_status: TransactionQueuesStatus;
}
export declare function create(args: {
    id?: string;
    status: TransactionStatus;
    owners: OwnerFactory.IOwner[];
    expires_at: Date;
    inquiry_key?: TransactionInquiryKeyFactory.ITransactionInquiryKey;
    queues_status?: TransactionQueuesStatus;
}): ITransaction;
