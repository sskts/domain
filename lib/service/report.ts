/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace ReportService
 */
import * as createDebug from 'debug';

import TransactionAdapter from '../adapter/transaction';

import transactionQueuesStatus from '../factory/transactionQueuesStatus';
import transactionStatus from '../factory/transactionStatus';

export type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:report');

export function transactionStatuses(): TransactionOperation<any> {
    return async (transactionAdapter: TransactionAdapter) => {
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

        const report = {
            numberOfTransactionsReady: numberOfTransactionsReady,
            numberOfTransactionsUnderway: numberOfTransactionsUnderway,
            numberOfTransactionsClosedWithQueuesUnexported: numberOfTransactionsClosedWithQueuesUnexported,
            numberOfTransactionsExpiredWithQueuesUnexported: numberOfTransactionsExpiredWithQueuesUnexported
        };
        debug(report);

        return report;
    };
}
