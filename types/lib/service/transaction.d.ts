import * as monapt from 'monapt';
import * as Transaction from '../factory/transaction';
import * as TransactionInquiryKey from '../factory/transactionInquiryKey';
import transactionStatus from '../factory/transactionStatus';
import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
export declare type TransactionAndQueueOperation<T> = (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export declare type OwnerAndTransactionOperation<T> = (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;
/**
 * 開始準備のできた取引を用意する
 *
 * @export
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 */
export declare function prepare(length: number, expiresInSeconds: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 取引を強制的に開始する
 *
 * @export
 * @param {Date} expiresAt
 */
export declare function startForcibly(expiresAt: Date): (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => Promise<Transaction.ITransaction>;
/**
 * 可能であれば取引開始する
 *
 * @param {Date} expiresAt
 * @returns {OwnerAndTransactionOperation<Promise<monapt.Option<Transaction.ITransaction>>>}
 *
 * @memberOf TransactionService
 */
export declare function startIfPossible(expiresAt: Date): (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => Promise<monapt.Option<Transaction.ITransaction>>;
/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function makeInquiry(key: TransactionInquiryKey.ITransactionInquiryKey): (transactionAdapter: TransactionAdapter) => Promise<monapt.Option<Transaction.ITransaction>>;
/**
 * 不要な取引を削除する
 */
export declare function clean(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 取引を期限切れにする
 */
export declare function makeExpired(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ひとつの取引のキューをエクスポートする
 *
 * @param {transactionStatus} statu 取引ステータス
 */
export declare function exportQueues(status: transactionStatus): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<"UNEXPORTED" | "EXPORTING" | "EXPORTED" | null>;
/**
 * キュー出力
 * todo TransactionWithIdに移行するべき？
 *
 * @param {string} id
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function exportQueuesById(id: string): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<string[]>;
/**
 * キューエクスポートリトライ
 * todo updated_atを基準にしているが、キューエクスポートトライ日時を持たせた方が安全か？
 *
 * @export
 * @param {number} intervalInMinutes
 */
export declare function reexportQueues(intervalInMinutes: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
