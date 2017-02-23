import Authorization from '../model/authorization';
import Notification from '../model/notification';
import QueueGroup from './queueGroup';
import QueueStatus from './queueStatus';
/**
 * キュー(実行日時つきのタスク)
 *
 * @class Queue
 *
 * @param {string} id
 * @param {QueueGroup} group キューグループ
 * @param {QueueStatus} status キューステータス
 * @param {Date} run_at 実行予定日時
 * @param {number} max_count_try 最大リトライ回数
 * @param {(Date | null)} last_tried_at 最終試行日時
 * @param {number} count_tried 試行回数
 * @param {Array<string>} results 実行結果リスト
 */
declare class Queue {
    readonly id: string;
    readonly group: QueueGroup;
    readonly status: QueueStatus;
    readonly run_at: Date;
    readonly max_count_try: number;
    readonly last_tried_at: Date | null;
    readonly count_tried: number;
    readonly results: string[];
    constructor(id: string, group: QueueGroup, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[]);
}
declare namespace Queue {
    /**
     * オーソリ解除キュー
     *
     *
     * @class CancelAuthorizationQueue
     * @extends {Queue}
     * @template T
     */
    class CancelAuthorizationQueue<T extends Authorization> extends Queue {
        readonly id: string;
        readonly status: QueueStatus;
        readonly run_at: Date;
        readonly max_count_try: number;
        readonly last_tried_at: Date | null;
        readonly count_tried: number;
        readonly results: string[];
        readonly authorization: T;
        /**
         * Creates an instance of CancelAuthorizationQueue.
         *
         * @param {string} id
         * @param {QueueStatus} status
         * @param {Date} run_at
         * @param {number} max_count_try
         * @param {(Date | null)} last_tried_at
         * @param {number} count_tried
         * @param {Array<string>} results
         * @param {T} authorization
         *
         * @memberOf CancelAuthorizationQueue
         */
        constructor(id: string, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], authorization: T);
    }
    /**
     * 取引照会無効化キュー
     *
     *
     * @class DisableTransactionInquiryQueue
     * @extends {Queue}
     */
    class DisableTransactionInquiryQueue extends Queue {
        readonly id: string;
        readonly status: QueueStatus;
        readonly run_at: Date;
        readonly max_count_try: number;
        readonly last_tried_at: Date | null;
        readonly count_tried: number;
        readonly results: string[];
        readonly transaction_id: string;
        /**
         * Creates an instance of DisableTransactionInquiryQueue.
         *
         * @param {string} id
         * @param {QueueStatus} status
         * @param {Date} run_at
         * @param {number} max_count_try
         * @param {(Date | null)} last_tried_at
         * @param {number} count_tried
         * @param {Array<string>} results
         * @param {string} transaction_id
         *
         * @memberOf DisableTransactionInquiryQueue
         */
        constructor(id: string, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], transaction_id: string);
    }
    /**
     * プッシュ通知キュー
     *
     *
     * @class PushNotificationQueue
     * @extends {Queue}
     * @template T
     */
    class PushNotificationQueue<T extends Notification> extends Queue {
        readonly id: string;
        readonly status: QueueStatus;
        readonly run_at: Date;
        readonly max_count_try: number;
        readonly last_tried_at: Date | null;
        readonly count_tried: number;
        readonly results: string[];
        readonly notification: T;
        /**
         * Creates an instance of PushNotificationQueue.
         *
         * @param {string} id
         * @param {QueueStatus} status
         * @param {Date} run_at
         * @param {number} max_count_try
         * @param {(Date | null)} last_tried_at
         * @param {number} count_tried
         * @param {Array<string>} results
         * @param {T} notification
         *
         * @memberOf PushNotificationQueue
         */
        constructor(id: string, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], notification: T);
    }
    /**
     * 資産移動キュー
     *
     *
     * @class SettleAuthorizationQueue
     * @extends {Queue}
     * @template T
     */
    class SettleAuthorizationQueue<T extends Authorization> extends Queue {
        readonly id: string;
        readonly status: QueueStatus;
        readonly run_at: Date;
        readonly max_count_try: number;
        readonly last_tried_at: Date | null;
        readonly count_tried: number;
        readonly results: string[];
        readonly authorization: T;
        /**
         * Creates an instance of SettleAuthorizationQueue.
         *
         * @param {string} id
         * @param {QueueStatus} status
         * @param {Date} run_at
         * @param {number} max_count_try
         * @param {(Date | null)} last_tried_at
         * @param {number} count_tried
         * @param {Array<string>} results
         * @param {T} authorization
         *
         * @memberOf SettleAuthorizationQueue
         */
        constructor(id: string, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], authorization: T);
    }
    interface IQueue {
        id: string;
        group: QueueGroup;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }
    function create(args: IQueue): Queue;
    function createSettleAuthorization<T extends Authorization>(args: {
        id: string;
        authorization: T;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): SettleAuthorizationQueue<T>;
    function createCancelAuthorization<T extends Authorization>(args: {
        id: string;
        authorization: T;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): CancelAuthorizationQueue<T>;
    function createPushNotification<T extends Notification>(args: {
        id: string;
        notification: T;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): PushNotificationQueue<T>;
    function createDisableTransactionInquiry(args: {
        id: string;
        transaction_id: string;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): DisableTransactionInquiryQueue;
}
export default Queue;
