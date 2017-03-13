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
 * @param {string} transactionId
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export declare function findById(transactionId: string): TransactionOperation<monapt.Option<Transaction.ITransaction>>;
/**
 * 取引開始
 *
 * @param {Date} expiresAt
 * @returns {OwnerAndTransactionOperation<Transaction>}
 *
 * @memberOf TransactionService
 */
export declare function start(expiresAt: Date): (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => Promise<monapt.Option<Transaction.ITransaction>>;
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
 * 照合を可能にする
 *
 * @param {string} transactionId
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export declare function enableInquiry(transactionId: string, key: TransactionInquiryKey.ITransactionInquiryKey): (transactionAdapter: TransactionAdapter) => Promise<void>;
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
export declare function close(transactionId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 取引期限切れ
 *
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function expireOne(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * キュー出力
 *
 * @param {string} transactionId
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function exportQueues(transactionId: string): (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => Promise<void>;
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
