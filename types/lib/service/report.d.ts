import GMONotificationAdapter from '../adapter/gmoNotification';
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
/**
 * GMO実売上検索
 */
export declare function searchGMOSales(dateFrom: Date, dateTo: Date): (gmoNotificationAdapter: GMONotificationAdapter) => Promise<{
    shop_id: string;
    order_id: string;
    amount: number;
    tran_date: string;
}[]>;
