/**
 * 取引イベントファクトリー
 *
 * @namespace factory/transactionEvent
 */

import TransactionEventGroup from './transactionEventGroup';

/**
 * 取引イベント
 *
 * @param {string} id
 * @param {string} transaction 取引ID
 * @param {TransactionEventGroup} group 取引イベントグループ
 * @param {Date} occurred_at 発生日時
 * @memberof tobereplaced$
 */
export interface ITransactionEvent {
    id: string;
    transaction: string;
    group: TransactionEventGroup;
    occurred_at: Date;
}
