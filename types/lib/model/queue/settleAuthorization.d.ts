/// <reference types="mongoose" />
import Authorization from "../authorization";
import ObjectId from "../objectId";
import Queue from "../queue";
import QueueStatus from "../queueStatus";
/**
 * 資産移動キュー
 *
 *
 * @class SettleAuthorizationQueue
 * @extends {Queue}
 * @template T
 */
export default class SettleAuthorizationQueue<T extends Authorization> extends Queue {
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
