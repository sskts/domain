import * as monapt from 'monapt';
import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as Transaction from '../factory/transaction';
import * as TransactionInquiryKey from '../factory/transactionInquiryKey';
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
 * @returns
 */
export declare function prepare(length: number, expiresInSeconds: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 匿名所有者更新
 *
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function updateAnonymousOwner(args: {
    transaction_id: string;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
}): OwnerAndTransactionOperation<void>;
/**
 * IDから取得する
 *
 * @param {string} id
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export declare function findById(id: string): TransactionOperation<monapt.Option<Transaction.ITransaction>>;
/**
 * 取引を強制的に開始する
 *
 * @export
 * @param {Date} expiresAt
 * @returns
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
 * GMO資産承認
 *
 * @param {string} transactionId
 * @param {GMOAuthorization} authorization
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function addGMOAuthorization(transactionId: string, authorization: Authorization.IGMOAuthorization): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * COA資産承認
 *
 * @param {string} transactionId
 * @param {COASeatReservationAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function addCOASeatReservationAuthorization(transactionId: string, authorization: Authorization.ICOASeatReservationAuthorization): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 資産承認解除
 *
 * @param {string} transactionId
 * @param {string} authorizationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function removeAuthorization(transactionId: string, authorizationId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function addEmail(transactionId: string, notification: Notification.IEmailNotification): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function removeEmail(transactionId: string, notificationId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 照合を可能にする
 *
 * @param {string} transactionId
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export declare function enableInquiry(id: string, key: TransactionInquiryKey.ITransactionInquiryKey): (transactionAdapter: TransactionAdapter) => Promise<void>;
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
 * 取引成立
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function close(id: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 取引を期限切れにする
 */
export declare function makeExpired(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ひとつの取引のキューをエクスポートする
 */
export declare function exportQueues(): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<"UNEXPORTED" | "EXPORTING" | "EXPORTED" | null>;
/**
 * キュー出力
 *
 * @param {string} id
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function exportQueuesById(id: string): (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<string[]>;
