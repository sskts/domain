import TransactionAdapter from '../adapter/transaction';
export declare type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;
export declare function transactionStatuses(): TransactionOperation<any>;
