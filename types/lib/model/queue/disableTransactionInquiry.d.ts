/// <reference types="mongoose" />
import ObjectId from "../objectId";
import Queue from "../queue";
import QueueStatus from "../queueStatus";
/**
 * 取引照会無効化キュー
 *
 *
 * @class DisableTransactionInquiryQueue
 * @extends {Queue}
 */
export default class DisableTransactionInquiryQueue extends Queue {
    readonly _id: ObjectId;
    readonly status: QueueStatus;
    readonly run_at: Date;
    readonly max_count_try: number;
    readonly last_tried_at: Date | null;
    readonly count_tried: number;
    readonly results: Array<string>;
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
    constructor(_id: ObjectId, status: QueueStatus, run_at: Date, max_count_try: number, last_tried_at: Date | null, count_tried: number, results: Array<string>, transaction_id: ObjectId);
}
