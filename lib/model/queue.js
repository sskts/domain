"use strict";
const queueGroup_1 = require("./queueGroup");
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
class Queue {
    constructor(id, group, status, run_at, max_count_try, last_tried_at, count_tried, results) {
        this.id = id;
        this.group = group;
        this.status = status;
        this.run_at = run_at;
        this.max_count_try = max_count_try;
        this.last_tried_at = last_tried_at;
        this.count_tried = count_tried;
        this.results = results;
        // todo validation
    }
}
(function (Queue) {
    /**
     * オーソリ解除キュー
     *
     *
     * @class CancelAuthorizationQueue
     * @extends {Queue}
     * @template T
     */
    // tslint:disable-next-line:max-classes-per-file
    class CancelAuthorizationQueue extends Queue {
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
        constructor(id, status, run_at, max_count_try, last_tried_at, count_tried, results, authorization) {
            super(id, queueGroup_1.default.CANCEL_AUTHORIZATION, status, run_at, max_count_try, last_tried_at, count_tried, results);
            this.id = id;
            this.status = status;
            this.run_at = run_at;
            this.max_count_try = max_count_try;
            this.last_tried_at = last_tried_at;
            this.count_tried = count_tried;
            this.results = results;
            this.authorization = authorization;
            // todo validation
        }
    }
    Queue.CancelAuthorizationQueue = CancelAuthorizationQueue;
    /**
     * 取引照会無効化キュー
     *
     *
     * @class DisableTransactionInquiryQueue
     * @extends {Queue}
     */
    // tslint:disable-next-line:max-classes-per-file
    class DisableTransactionInquiryQueue extends Queue {
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
        constructor(id, status, run_at, max_count_try, last_tried_at, count_tried, results, transaction) {
            super(id, queueGroup_1.default.DISABLE_TRANSACTION_INQUIRY, status, run_at, max_count_try, last_tried_at, count_tried, results);
            this.id = id;
            this.status = status;
            this.run_at = run_at;
            this.max_count_try = max_count_try;
            this.last_tried_at = last_tried_at;
            this.count_tried = count_tried;
            this.results = results;
            this.transaction = transaction;
            // todo validation
        }
    }
    Queue.DisableTransactionInquiryQueue = DisableTransactionInquiryQueue;
    /**
     * プッシュ通知キュー
     *
     *
     * @class PushNotificationQueue
     * @extends {Queue}
     * @template T
     */
    // tslint:disable-next-line:max-classes-per-file
    class PushNotificationQueue extends Queue {
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
        constructor(id, status, run_at, max_count_try, last_tried_at, count_tried, results, notification) {
            super(id, queueGroup_1.default.PUSH_NOTIFICATION, status, run_at, max_count_try, last_tried_at, count_tried, results);
            this.id = id;
            this.status = status;
            this.run_at = run_at;
            this.max_count_try = max_count_try;
            this.last_tried_at = last_tried_at;
            this.count_tried = count_tried;
            this.results = results;
            this.notification = notification;
            // todo validation
        }
    }
    Queue.PushNotificationQueue = PushNotificationQueue;
    /**
     * 資産移動キュー
     *
     *
     * @class SettleAuthorizationQueue
     * @extends {Queue}
     * @template T
     */
    // tslint:disable-next-line:max-classes-per-file
    class SettleAuthorizationQueue extends Queue {
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
        constructor(id, status, run_at, max_count_try, last_tried_at, count_tried, results, authorization) {
            super(id, queueGroup_1.default.SETTLE_AUTHORIZATION, status, run_at, max_count_try, last_tried_at, count_tried, results);
            this.id = id;
            this.status = status;
            this.run_at = run_at;
            this.max_count_try = max_count_try;
            this.last_tried_at = last_tried_at;
            this.count_tried = count_tried;
            this.results = results;
            this.authorization = authorization;
            // todo validation
        }
    }
    Queue.SettleAuthorizationQueue = SettleAuthorizationQueue;
    function create(args) {
        return new Queue(args.id, args.group, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results);
    }
    Queue.create = create;
    function createSettleAuthorization(args) {
        return new SettleAuthorizationQueue(args.id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.authorization);
    }
    Queue.createSettleAuthorization = createSettleAuthorization;
    function createCancelAuthorization(args) {
        return new CancelAuthorizationQueue(args.id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.authorization);
    }
    Queue.createCancelAuthorization = createCancelAuthorization;
    function createPushNotification(args) {
        return new PushNotificationQueue(args.id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.notification);
    }
    Queue.createPushNotification = createPushNotification;
    function createDisableTransactionInquiry(args) {
        return new DisableTransactionInquiryQueue(args.id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.transaction);
    }
    Queue.createDisableTransactionInquiry = createDisableTransactionInquiry;
})(Queue || (Queue = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queue;
