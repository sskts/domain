/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace ReportService
 */
import * as createDebug from 'debug';

import TransactionAdapter from '../adapter/transaction';

import transactionStatus from '../factory/transactionStatus';

export type Operation<T> = () => Promise<T>;

const debug = createDebug('sskts-domain:service:report');

export function transactionStatuses() {
    return async (transactionAdapter: TransactionAdapter) => {
        debug('counting ready transactions...');
        const nubmerOfReadyTransactions = await transactionAdapter.transactionModel.count({
            status: transactionStatus.READY,
            expires_at: { $gt: new Date() }
        }).exec();

        debug('counting underway transactions...');
        const nubmerOfUnderwayTransactions = await transactionAdapter.transactionModel.count({
            status: transactionStatus.UNDERWAY
        }).exec();

        return {
            nubmerOfReadyTransactions: nubmerOfReadyTransactions,
            nubmerOfUnderwayTransactions: nubmerOfUnderwayTransactions
        };
    };
}
