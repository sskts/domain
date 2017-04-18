import GMONotificationAdapter from '../adapter/gmoNotification';
import QueueAdapter from '../adapter/queue';
import TelemetryAdapter from '../adapter/telemetry';
import TransactionAdapter from '../adapter/transaction';
export declare type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type QueueAndTelemetryAndTransactionOperation<T> = (queueAdapter: QueueAdapter, telemetryAdapter: TelemetryAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export interface IReportTransactionStatuses {
    numberOfTransactionsReady: number;
    numberOfTransactionsUnderway: number;
    numberOfTransactionsClosedWithQueuesUnexported: number;
    numberOfTransactionsExpiredWithQueuesUnexported: number;
    numberOfQueuesUnexecuted: number;
}
/**
 * 測定データを作成する
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
export declare function createTelemetry(): QueueAndTelemetryAndTransactionOperation<void>;
/**
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
export declare function transactionStatuses(): QueueAndTransactionOperation<IReportTransactionStatuses>;
/**
 * GMO実売上検索
 * @memberof service/report
 */
export declare function searchGMOSales(dateFrom: Date, dateTo: Date): (gmoNotificationAdapter: GMONotificationAdapter) => Promise<{
    shop_id: string;
    order_id: string;
    amount: number;
    tran_date: string;
}[]>;
