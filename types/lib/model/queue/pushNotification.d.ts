/// <reference types="mongoose" />
import Notification from "../notification";
import ObjectId from "../objectId";
import Queue from "../queue";
import QueueStatus from "../queueStatus";
/**
 * プッシュ通知キュー
 *
 *
 * @class PushNotificationQueue
 * @extends {Queue}
 * @template T
 */
export default class PushNotificationQueue<T extends Notification> extends Queue {
    readonly _id: ObjectId;
    readonly status: QueueStatus;
    readonly run_at: Date;
    readonly max_count_try: number;
    readonly last_tried_at: Date | null;
    readonly count_tried: number;
    readonly results: Array<string>;
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
    constructor(_id: ObjectId, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: Array<string>, notification: T);
}
