import AssetAdapter from '../adapter/asset';
import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
export declare type AssetAndOwnerAndQueueOperation<T> = (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export declare type QueueOperation<T> = (queueAdapter: QueueAdapter) => Promise<T>;
export declare type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
/**
 * メール送信キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export declare function executeSendEmailNotification(): QueueOperation<void>;
/**
 * COA仮予約キャンセルキュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export declare function executeCancelCOASeatReservationAuthorization(): QueueOperation<void>;
/**
 * GMO仮売上取消キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export declare function executeCancelGMOAuthorization(): QueueOperation<void>;
/**
 * 取引照会無効化キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueAndTransactionOperation<void>}
 */
export declare function executeDisableTransactionInquiry(): QueueAndTransactionOperation<void>;
/**
 * COA本予約キュー実行
 *
 * @memberOf QueueService
 * @returns {AssetAndQueueOperation<void>}
 */
export declare function executeSettleCOASeatReservationAuthorization(): AssetAndOwnerAndQueueOperation<void>;
/**
 * GMO実売上キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export declare function executeSettleGMOAuthorization(): QueueOperation<void>;
/**
 * ムビチケ資産移動キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export declare function executeSettleMvtkAuthorization(): QueueOperation<void>;
/**
 * リトライ
 *
 * @memberOf QueueService
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューをリトライするか
 * @returns {QueueOperation<void>}
 */
export declare function retry(intervalInMinutes: number): QueueOperation<void>;
/**
 * 実行中止
 *
 * @memberOf QueueService
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューを中止するか
 * @returns {QueueOperation<void>}
 */
export declare function abort(intervalInMinutes: number): QueueOperation<void>;
