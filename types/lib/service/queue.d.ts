import AssetAdapter from '../adapter/asset';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
/**
 * メール送信キュー実行
 *
 * @export
 */
export declare function executeSendEmailNotification(): (queueAdapter: QueueAdapter) => Promise<void>;
/**
 * COA仮予約キャンセルキュー実行
 *
 * @export
 */
export declare function executeCancelCOASeatReservationAuthorization(): (queueAdapter: QueueAdapter) => Promise<void>;
/**
 * GMO仮売上取消キュー実行
 *
 * @export
 */
export declare function executeCancelGMOAuthorization(): (queueAdapter: QueueAdapter) => Promise<void>;
/**
 * 取引照会無効化キュー実行
 *
 * @export
 */
export declare function executeDisableTransactionInquiry(): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * COA本予約キュー実行
 *
 * @export
 */
export declare function executeSettleCOASeatReservationAuthorization(): (assetAdapter: AssetAdapter, queueAdapter: QueueAdapter) => Promise<void>;
/**
 * GMO実売上キュー実行
 *
 * @export
 */
export declare function executeSettleGMOAuthorization(): (queueAdapter: QueueAdapter) => Promise<void>;
/**
 * リトライ
 *
 * @export
 * @param {number} intervalInMinutes
 */
export declare function retry(intervalInMinutes: number): (queueAdapter: QueueAdapter) => Promise<void>;
/**
 * 実行中止
 *
 * @export
 * @param {number} intervalInMinutes
 */
export declare function abort(intervalInMinutes: number): (queueAdapter: QueueAdapter) => Promise<void>;
