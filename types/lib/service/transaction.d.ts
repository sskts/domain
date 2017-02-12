import * as monapt from "monapt";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import GMOAuthorization from "../model/authorization/gmo";
import EmailNotification from "../model/notification/email";
import Transaction from "../model/transaction";
import TransactionInquiryKey from "../model/transactionInquiryKey";
import OwnerRepository from "../repository/owner";
import QueueRepository from "../repository/queue";
import TransactionRepository from "../repository/transaction";
export declare type TransactionAndQueueOperation<T> = (transastionRepository: TransactionRepository, queueRepository: QueueRepository) => Promise<T>;
export declare type OwnerAndTransactionOperation<T> = (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<T>;
export declare type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;
/**
 * 取引サービス
 * 主に、取引中(購入プロセス中)に使用されるファンクション群
 *
 * @interface TransactionService
 */
interface TransactionService {
    /** 匿名所有者の情報を更新する */
    updateAnonymousOwner(args: {
        /** 取引ID */
        /**
         *
         *
         * @type {string}
         */
        transaction_id: string;
        /** 名 */
        /**
         *
         *
         * @type {string}
         */
        name_first?: string;
        /** 姓 */
        /**
         *
         *
         * @type {string}
         */
        name_last?: string;
        /** メールアドレス */
        /**
         *
         *
         * @type {string}
         */
        email?: string;
        /** 電話番号 */
        /**
         *
         *
         * @type {string}
         */
        tel?: string;
    }): OwnerAndTransactionOperation<void>;
    /**
     * 取引詳細取得
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionService
     */
    findById(transactionId: string): TransactionOperation<monapt.Option<Transaction>>;
    /**
     * 取引開始
     *
     * @param {Date} expiredAt
     * @returns {OwnerAndTransactionOperation<Transaction>}
     *
     * @memberOf TransactionService
     */
    start(expiredAt: Date): OwnerAndTransactionOperation<Transaction>;
    /**
     * GMOオーソリを追加する
     *
     * @param {string} transactionId
     * @param {GMOAuthorization} authorization
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    addGMOAuthorization(transactionId: string, authorization: GMOAuthorization): TransactionOperation<void>;
    /**
     * COA仮予約を追加する
     *
     * @param {string} transactionId
     * @param {COASeatReservationAuthorization} authorization
     * @returns {OwnerAndTransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    addCOASeatReservationAuthorization(transactionId: string, authorization: COASeatReservationAuthorization): TransactionOperation<void>;
    /**
     * オーソリアイテムを削除する
     *
     * @param {string} transactionId
     * @param {string} authorizationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    removeAuthorization(transactionId: string, authorizationId: string): TransactionOperation<void>;
    /**
     * 照会を可能にする
     *
     * @param {string} transactionId
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    enableInquiry(transactionId: string, key: TransactionInquiryKey): TransactionOperation<void>;
    /**
     * 照会する
     *
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionService
     */
    makeInquiry(key: TransactionInquiryKey): TransactionOperation<monapt.Option<Transaction>>;
    /**
     * 取引成立後に送信されるメールを追加する
     *
     * @param {string} transactionId
     * @param {EmailNotification} notification
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    addEmail(transactionId: string, notification: EmailNotification): TransactionOperation<void>;
    /**
     * 取引成立後に送信されるメールを削除する
     *
     * @param {string} transactionId
     * @param {string} notificationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    removeEmail(transactionId: string, notificationId: string): TransactionOperation<void>;
    /**
     * 取引成立
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    close(transactionId: string): TransactionOperation<void>;
    /**
     * 取引期限切れ
     *
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionService
     */
    expireOne(): TransactionOperation<void>;
    /**
     * 取引に関するキュー(非同期で実行されるべき処理)を出力する
     *
     * @param {string} transactionId
     * @returns {TransactionAndQueueOperation<void>}
     *
     * @memberOf TransactionService
     */
    exportQueues(transactionId: string): TransactionAndQueueOperation<void>;
}
export default TransactionService;
