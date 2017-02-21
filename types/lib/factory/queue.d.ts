/// <reference types="mongoose" />
/**
 * キューファクトリー
 *
 * @namespace QueueFactory
 */
import ObjectId from '../model/objectId';
import Queue from '../model/queue';
import QueueGroup from '../model/queueGroup';
import QueueStatus from '../model/queueStatus';
export declare function create(args: {
    _id: ObjectId;
    group: QueueGroup;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): Queue;
