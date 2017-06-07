import * as monapt from 'monapt';
import * as TransactionFactory from '../factory/transaction';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';
import TransactionStatus from '../factory/transactionStatus';
import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
import TransactionCountAdapter from '../adapter/transactionCount';
export declare type TransactionAndQueueOperation<T> = (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export declare type OwnerAndTransactionAndTransactionCountOperation<T> = (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => Promise<T>;
export declare type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;
/**
 * スコープ指定で取引が利用可能かどうかを取得する
 *
 * @param {string} scope 取引のスコープ
 * @param {number} unitOfCountInSeconds 取引数カウント単位時間(秒)
 * @param {number} maxCountPerUnit カウント単位あたりの取引最大数
 */
export declare function isAvailable(scope: string, unitOfCountInSeconds: number, maxCountPerUnit: number): (transactionCountAdapter: TransactionCountAdapter) => Promise<boolean>;
/**
 * 開始準備のできた取引を用意する
 *
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 * @memberof service/transaction
 */
export declare function prepare(length: number, expiresInSeconds: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 可能であれば取引開始する
 *
 * @param {Date} expiresAt 期限切れ予定日時
 * @param {number} unitOfCountInSeconds 取引数制限単位期間
 * @param {number} maxCountPerUnit 単位期間あたりの最大取引数
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 *
 * @memberof service/transaction
 */
export declare function startIfPossible(expiresAt: Date, unitOfCountInSeconds: number, maxCountPerUnit: number): OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>;
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
