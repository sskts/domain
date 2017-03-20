import TransactionAdapter from '../adapter/transaction';
export declare type Operation<T> = () => Promise<T>;
export declare function transactionStatuses(): (transactionAdapter: TransactionAdapter) => Promise<{
    nubmerOfTransactionsReady: number;
    nubmerOfTransactionsUnderway: number;
    nubmerOfTransactionsClosedWithQueuesUnexported: number;
    nubmerOfTransactionsExpiredWithQueuesUnexported: number;
}>;
