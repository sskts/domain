import AssetAdapter from '../adapter/asset';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
/**
 * メール送信キュー実行
 *
 * @export
 * @returns
 */
export declare function executeSendEmailNotification(): (queueAdapter: QueueAdapter) => Promise<"UNEXECUTED" | "RUNNING" | "EXECUTED" | "ABORTED" | null>;
/**
 * COA仮予約キャンセルキュー実行
 *
 * @export
 * @returns
 */
export declare function executeCancelCOASeatReservationAuthorization(): (queueAdapter: QueueAdapter) => Promise<"UNEXECUTED" | "RUNNING" | "EXECUTED" | "ABORTED" | null>;
/**
 * GMO仮売上取消キュー実行
 *
 * @export
 * @returns
 */
export declare function executeCancelGMOAuthorization(): (queueAdapter: QueueAdapter) => Promise<"UNEXECUTED" | "RUNNING" | "EXECUTED" | "ABORTED" | null>;
/**
 * 取引照会無効化キュー実行
 *
 * @export
 * @returns
 */
export declare function executeDisableTransactionInquiry(): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<"UNEXECUTED" | "RUNNING" | "EXECUTED" | "ABORTED" | null>;
/**
 * COA本予約キュー実行
 *
 * @export
 * @returns
 */
export declare function executeSettleCOASeatReservationAuthorization(): (assetAdapter: AssetAdapter, queueAdapter: QueueAdapter) => Promise<"UNEXECUTED" | "RUNNING" | "EXECUTED" | "ABORTED" | null>;
/**
 * GMO実売上キュー実行
 *
 * @export
 * @returns
 */
export declare function executeSettleGMOAuthorization(): (queueAdapter: QueueAdapter) => Promise<"UNEXECUTED" | "RUNNING" | "EXECUTED" | "ABORTED" | null>;
/**
 * リトライ
 *
 * @export
 * @param {number} intervalInMinutes
 * @returns
 */
export declare function retry(intervalInMinutes: number): (queueAdapter: QueueAdapter) => Promise<void>;
/**
 * 実行中止
 *
 * @export
 * @param {number} intervalInMinutes
 * @returns
 */
export declare function abort(intervalInMinutes: number): (queueAdapter: QueueAdapter) => Promise<string | null>;
