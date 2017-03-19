import TransactionAdapter from '../adapter/transaction';
export declare type Operation<T> = () => Promise<T>;
export declare function transactionStatuses(): (transactionAdapter: TransactionAdapter) => Promise<{
    nubmerOfReadyTransactions: number;
    nubmerOfUnderwayTransactions: number;
}>;
