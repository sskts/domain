"use strict";
const queue_1 = require("../queue");
const queueGroup_1 = require("../queueGroup");
/**
 * プッシュ通知キュー
 *
 *
 * @class PushNotificationQueue
 * @extends {Queue}
 * @template T
 */
class PushNotificationQueue extends queue_1.default {
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
    constructor(_id, status, run_at, max_count_try, last_tried_at, count_tried, results, notification) {
        super(_id, queueGroup_1.default.PUSH_NOTIFICATION, status, run_at, max_count_try, last_tried_at, count_tried, results);
        this._id = _id;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PushNotificationQueue;
