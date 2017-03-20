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

export type Operation<T> = () => Promise<T>;

const debug = createDebug('sskts-domain:service:report');

export function transactionStatuses() {
    return async (transactionAdapter: TransactionAdapter) => {
        debug('counting ready transactions...');
        const nubmerOfTransactionsReady = await transactionAdapter.transactionModel.count({
            status: transactionStatus.READY,
            expires_at: { $gt: new Date() }
        }).exec();

        debug('counting underway transactions...');
        const nubmerOfTransactionsUnderway = await transactionAdapter.transactionModel.count({
            status: transactionStatus.UNDERWAY
        }).exec();

        const nubmerOfTransactionsClosedWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: transactionStatus.CLOSED,
            queues_status: transactionQueuesStatus.UNEXPORTED
        }).exec();

        const nubmerOfTransactionsExpiredWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: transactionStatus.EXPIRED,
            queues_status: transactionQueuesStatus.UNEXPORTED
        }).exec();

        const report = {
            nubmerOfTransactionsReady: nubmerOfTransactionsReady,
            nubmerOfTransactionsUnderway: nubmerOfTransactionsUnderway,
            nubmerOfTransactionsClosedWithQueuesUnexported: nubmerOfTransactionsClosedWithQueuesUnexported,
            nubmerOfTransactionsExpiredWithQueuesUnexported: nubmerOfTransactionsExpiredWithQueuesUnexported
        };
        debug(report);

        return report;
    };
}
