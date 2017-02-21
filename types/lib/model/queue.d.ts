import Authorization from '../model/authorization';
import Notification from '../model/notification';
import ObjectId from './objectId';
import QueueGroup from './queueGroup';
import QueueStatus from './queueStatus';
/**
 * キュー(実行日時つきのタスク)
 *
 * @class Queue
 *
 * @param {ObjectId} _id
 * @param {QueueGroup} group キューグループ
 * @param {QueueStatus} status キューステータス
 * @param {Date} run_at 実行予定日時
 * @param {number} max_count_try 最大リトライ回数
 * @param {(Date | null)} last_tried_at 最終試行日時
 * @param {number} count_tried 試行回数
 * @param {Array<string>} results 実行結果リスト
 */
declare class Queue {
    readonly _id: ObjectId;
    readonly group: QueueGroup;
    readonly status: QueueStatus;
    readonly run_at: Date;
    readonly max_count_try: number;
    readonly last_tried_at: Date | null;
    readonly count_tried: number;
    readonly results: string[];
    constructor(_id: ObjectId, group: QueueGroup, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[]);
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
        readonly _id: ObjectId;
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
         * @param {ObjectId} _id
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
        constructor(_id: ObjectId, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], authorization: T);
    }
    /**
     * 取引照会無効化キュー
     *
     *
     * @class DisableTransactionInquiryQueue
     * @extends {Queue}
     */
    class DisableTransactionInquiryQueue extends Queue {
        readonly _id: ObjectId;
        readonly status: QueueStatus;
        readonly run_at: Date;
        readonly max_count_try: number;
        readonly last_tried_at: Date | null;
        readonly count_tried: number;
        readonly results: string[];
        readonly transaction_id: ObjectId;
        /**
         * Creates an instance of DisableTransactionInquiryQueue.
         *
         * @param {ObjectId} _id
         * @param {QueueStatus} status
         * @param {Date} run_at
         * @param {number} max_count_try
         * @param {(Date | null)} last_tried_at
         * @param {number} count_tried
         * @param {Array<string>} results
         * @param {ObjectId} transaction_id
         *
         * @memberOf DisableTransactionInquiryQueue
         */
        constructor(_id: ObjectId, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], transaction_id: ObjectId);
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
        readonly _id: ObjectId;
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
         * @param {ObjectId} _id
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
        constructor(_id: ObjectId, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], notification: T);
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
        readonly _id: ObjectId;
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
         * @param {ObjectId} _id
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
        constructor(_id: ObjectId, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: string[], authorization: T);
    }
    interface IQueue {
        _id: ObjectId;
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
        _id: ObjectId;
        authorization: T;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): SettleAuthorizationQueue<T>;
    function createCancelAuthorization<T extends Authorization>(args: {
        _id: ObjectId;
        authorization: T;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): CancelAuthorizationQueue<T>;
    function createPushNotification<T extends Notification>(args: {
        _id: ObjectId;
        notification: T;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): PushNotificationQueue<T>;
    function createDisableTransactionInquiry(args: {
        _id: ObjectId;
        transaction_id: ObjectId;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }): DisableTransactionInquiryQueue;
}
export default Queue;
