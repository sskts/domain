import TransactionService from "../transaction";
import * as monapt from "monapt";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import GMOAuthorization from "../../model/authorization/gmo";
import EmailNotification from "../../model/notification/email";
import Transaction from "../../model/transaction";
import TransactionInquiryKey from "../../model/transactionInquiryKey";
import OwnerRepository from "../../repository/owner";
import QueueRepository from "../../repository/queue";
import TransactionRepository from "../../repository/transaction";
export declare type TransactionAndQueueOperation<T> = (transactionRepo: TransactionRepository, queueRepo: QueueRepository) => Promise<T>;
export declare type OwnerAndTransactionOperation<T> = (ownerRepo: OwnerRepository, transactionRepo: TransactionRepository) => Promise<T>;
export declare type TransactionOperation<T> = (transactionRepo: TransactionRepository) => Promise<T>;
/**
 * 取引サービス
 *
 * @class TransactionServiceInterpreter
 * @implements {TransactionService}
 */
export default class TransactionServiceInterpreter implements TransactionService {
    /**
     * 匿名所有者更新
     *
     * @returns {OwnerAndTransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    updateAnonymousOwner(args: {
        /**
         *
         *
         * @type {string}
         */
        transaction_id: string;
        /**
         *
         *
         * @type {string}
         */
        name_first?: string;
        /**
         *
         *
         * @type {string}
         */
        name_last?: string;
        /**
         *
         *
         * @type {string}
         */
        email?: string;
        /**
         *
         *
         * @type {string}
         */
        tel?: string;
    }): OwnerAndTransactionOperation<void>;
    /**
     * IDから取得する
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    findById(transactionId: string): TransactionOperation<monapt.Option<Transaction>>;
    /**
     * 取引開始
     *
     * @param {Date} expiredAt
     * @returns {OwnerAndTransactionOperation<Transaction>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    start(expiredAt: Date): (ownerRepo: OwnerRepository, transactionRepo: TransactionRepository) => Promise<Transaction>;
    /**
     * GMO資産承認
     *
     * @param {string} transactionId
     * @param {GMOAuthorization} authorization
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    addGMOAuthorization(transactionId: string, authorization: GMOAuthorization): (transactionRepo: TransactionRepository) => Promise<void>;
    /**
     * COA資産承認
     *
     * @param {string} transactionId
     * @param {COASeatReservationAuthorization} authorization
     * @returns {OwnerAndTransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    addCOASeatReservationAuthorization(transactionId: string, authorization: COASeatReservationAuthorization): (transactionRepo: TransactionRepository) => Promise<void>;
    /**
     * 資産承認解除
     *
     * @param {string} transactionId
     * @param {string} authorizationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    removeAuthorization(transactionId: string, authorizationId: string): (transactionRepo: TransactionRepository) => Promise<void>;
    /**
     * 照合を可能にする
     *
     * @param {string} transactionId
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    enableInquiry(transactionId: string, key: TransactionInquiryKey): (transactionRepo: TransactionRepository) => Promise<void>;
    /**
     * 照会する
     *
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    makeInquiry(key: TransactionInquiryKey): TransactionOperation<monapt.Option<Transaction>>;
    /**
     * 取引成立
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    close(transactionId: string): (transactionRepo: TransactionRepository) => Promise<void>;
    /**
     * 取引期限切れ
     *
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    expireOne(): (transactionRepo: TransactionRepository) => Promise<void>;
    /**
     * キュー出力
     *
     * @param {string} transactionId
     * @returns {TransactionAndQueueOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    exportQueues(transactionId: string): (transactionRepo: TransactionRepository, queueRepo: QueueRepository) => Promise<void>;
    /**
     * メール追加
     *
     * @param {string} transactionId
     * @param {EmailNotification} notification
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    addEmail(transactionId: string, notification: EmailNotification): (transactionRepo: TransactionRepository) => Promise<void>;
    /**
     * メール削除
     *
     * @param {string} transactionId
     * @param {string} notificationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    removeEmail(transactionId: string, notificationId: string): (transactionRepo: TransactionRepository) => Promise<void>;
    private pushAuthorization(transactionId, authorization);
}
