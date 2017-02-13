/// <reference types="mongoose" />
/**
 * キューファクトリー
 *
 * @namespace QueueFactory
 */
import ObjectId from "../model/objectId";
import Authorization from "../model/authorization";
import Notification from "../model/notification";
import Queue from "../model/queue";
import CancelAuthorizationQueue from "../model/queue/cancelAuthorization";
import DisableTransactionInquiryQueue from "../model/queue/disableTransactionInquiry";
import PushNotificationQueue from "../model/queue/pushNotification";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import QueueGroup from "../model/queueGroup";
import QueueStatus from "../model/queueStatus";
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
export declare function createSettleAuthorization<T extends Authorization>(args: {
    _id: ObjectId;
    authorization: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): SettleAuthorizationQueue<T>;
export declare function createCancelAuthorization<T extends Authorization>(args: {
    _id: ObjectId;
    authorization: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): CancelAuthorizationQueue<T>;
export declare function createPushNotification<T extends Notification>(args: {
    _id: ObjectId;
    notification: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): PushNotificationQueue<T>;
export declare function createDisableTransactionInquiry(args: {
    _id: ObjectId;
    transaction_id: ObjectId;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): DisableTransactionInquiryQueue;
