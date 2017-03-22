/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace ReportService
 */
import * as createDebug from 'debug';

import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';

import QueueStatus from '../factory/queueStatus';
import TransactionQueuesStatus from '../factory/transactionQueuesStatus';
import TransactionStatus from '../factory/transactionStatus';

export type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:report');

export interface IReportTransactionStatuses {
    numberOfTransactionsReady: number;
    numberOfTransactionsUnderway: number;
    numberOfTransactionsClosedWithQueuesUnexported: number;
    numberOfTransactionsExpiredWithQueuesUnexported: number;
    numberOfQueuesUnexecuted: number;
}

export function transactionStatuses(): QueueAndTransactionOperation<IReportTransactionStatuses> {
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
        debug('counting ready transactions...');
        const numberOfTransactionsReady = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.READY,
            expires_at: { $gt: new Date() }
        }).exec();

        debug('counting underway transactions...');
        const numberOfTransactionsUnderway = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.UNDERWAY
        }).exec();

        const numberOfTransactionsClosedWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.CLOSED,
            queues_status: TransactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfTransactionsExpiredWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.EXPIRED,
            queues_status: TransactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfQueuesUnexecuted = await queueAdapter.model.count({
            status: QueueStatus.UNEXECUTED
        }).exec();

        return {
            numberOfTransactionsReady: numberOfTransactionsReady,
            numberOfTransactionsUnderway: numberOfTransactionsUnderway,
            numberOfTransactionsClosedWithQueuesUnexported: numberOfTransactionsClosedWithQueuesUnexported,
            numberOfTransactionsExpiredWithQueuesUnexported: numberOfTransactionsExpiredWithQueuesUnexported,
            numberOfQueuesUnexecuted: numberOfQueuesUnexecuted
        };
    };
}
