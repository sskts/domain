import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
export declare type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export interface IReportTransactionStatuses {
    numberOfTransactionsReady: number;
    numberOfTransactionsUnderway: number;
    numberOfTransactionsClosedWithQueuesUnexported: number;
    numberOfTransactionsExpiredWithQueuesUnexported: number;
    numberOfQueuesUnexecuted: number;
}
export declare function transactionStatuses(): QueueAndTransactionOperation<IReportTransactionStatuses>;
