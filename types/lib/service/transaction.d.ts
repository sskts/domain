import * as monapt from 'monapt';
import * as TransactionFactory from '../factory/transaction';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';
import * as TransactionScopeFactory from '../factory/transactionScope';
import TransactionStatus from '../factory/transactionStatus';
import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
import TransactionCountAdapter from '../adapter/transactionCount';
export declare type TransactionAndQueueOperation<T> = (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export declare type OwnerAndTransactionAndTransactionCountOperation<T> = (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => Promise<T>;
export declare type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;
/**
 * 開始準備のできた取引を用意する
 *
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 * @memberof service/transaction
 */
export declare function prepare(length: number, expiresInSeconds: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 匿名所有者として取引開始する
 *
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.unitOfCountInSeconds 取引数制限単位期間
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 *
 * @memberof service/transaction
 */
export declare function startAsAnonymous(args: {
    expiresAt: Date;
    maxCountPerUnit: number;
    state: string;
    scope: TransactionScopeFactory.ITransactionScope;
}): OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>;
/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction
 */
export declare function makeInquiry(key: TransactionInquiryKeyFactory.ITransactionInquiryKey): (transactionAdapter: TransactionAdapter) => Promise<monapt.Option<TransactionFactory.ITransaction>>;
/**
 * 不要な取引を削除する
 * @memberof service/transaction
 */
export declare function clean(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 取引を期限切れにする
 * @memberof service/transaction
 */
export declare function makeExpired(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ひとつの取引のキューをエクスポートする
 *
 * @param {TransactionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
export declare function exportQueues(status: TransactionStatus): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ID指定で取引のキュー出力
 *
 * @param {string} id
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberof service/transaction
 */
export declare function exportQueuesById(id: string): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * キューエクスポートリトライ
 * todo updated_atを基準にしているが、キューエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export declare function reexportQueues(intervalInMinutes: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
