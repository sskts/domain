import * as monapt from 'monapt';
import * as Authorization from '../model/authorization';
import * as Notification from '../model/notification';
import * as Transaction from '../model/transaction';
import * as TransactionInquiryKey from '../model/transactionInquiryKey';
import OwnerRepository from '../repository/owner';
import QueueRepository from '../repository/queue';
import TransactionRepository from '../repository/transaction';
export declare type TransactionAndQueueOperation<T> = (transactionRepo: TransactionRepository, queueRepo: QueueRepository) => Promise<T>;
export declare type OwnerAndTransactionOperation<T> = (ownerRepo: OwnerRepository, transactionRepo: TransactionRepository) => Promise<T>;
export declare type TransactionOperation<T> = (transactionRepo: TransactionRepository) => Promise<T>;
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
 * @param {Date} expiredAt
 * @returns {OwnerAndTransactionOperation<Transaction>}
 *
 * @memberOf TransactionService
 */
export declare function start(expiredAt: Date): (ownerRepo: OwnerRepository, transactionRepo: TransactionRepository) => Promise<Transaction.ITransaction>;
/**
 * GMO資産承認
 *
 * @param {string} transactionId
 * @param {GMOAuthorization} authorization
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function addGMOAuthorization(transactionId: string, authorization: Authorization.IGMOAuthorization): (transactionRepo: TransactionRepository) => Promise<void>;
/**
 * COA資産承認
 *
 * @param {string} transactionId
 * @param {COASeatReservationAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function addCOASeatReservationAuthorization(transactionId: string, authorization: Authorization.ICOASeatReservationAuthorization): (transactionRepo: TransactionRepository) => Promise<void>;
/**
 * 資産承認解除
 *
 * @param {string} transactionId
 * @param {string} authorizationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function removeAuthorization(transactionId: string, authorizationId: string): (transactionRepo: TransactionRepository) => Promise<void>;
/**
 * 照合を可能にする
 *
 * @param {string} transactionId
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export declare function enableInquiry(transactionId: string, key: TransactionInquiryKey.ITransactionInquiryKey): (transactionRepo: TransactionRepository) => Promise<void>;
/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function makeInquiry(key: TransactionInquiryKey.ITransactionInquiryKey): (transactionRepo: TransactionRepository) => Promise<monapt.Option<Transaction.ITransaction>>;
/**
 * 取引成立
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function close(transactionId: string): (transactionRepo: TransactionRepository) => Promise<void>;
/**
 * 取引期限切れ
 *
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function expireOne(): (transactionRepo: TransactionRepository) => Promise<void>;
/**
 * キュー出力
 *
 * @param {string} transactionId
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function exportQueues(transactionId: string): (transactionRepo: TransactionRepository, queueRepo: QueueRepository) => Promise<void>;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function addEmail(transactionId: string, notification: Notification.IEmailNotification): (transactionRepo: TransactionRepository) => Promise<void>;
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export declare function removeEmail(transactionId: string, notificationId: string): (transactionRepo: TransactionRepository) => Promise<void>;
