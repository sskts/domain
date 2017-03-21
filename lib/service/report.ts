/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace ReportService
 */
import * as createDebug from 'debug';

import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';

import queueStatus from '../factory/queueStatus';
import transactionQueuesStatus from '../factory/transactionQueuesStatus';
import transactionStatus from '../factory/transactionStatus';

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
            status: transactionStatus.READY,
            expires_at: { $gt: new Date() }
        }).exec();

        debug('counting underway transactions...');
        const numberOfTransactionsUnderway = await transactionAdapter.transactionModel.count({
            status: transactionStatus.UNDERWAY
        }).exec();

        const numberOfTransactionsClosedWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: transactionStatus.CLOSED,
            queues_status: transactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfTransactionsExpiredWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: transactionStatus.EXPIRED,
            queues_status: transactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfQueuesUnexecuted = await queueAdapter.model.count({
            status: queueStatus.UNEXECUTED
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
