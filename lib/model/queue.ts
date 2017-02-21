// tslint:disable:variable-name
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
class Queue {
    constructor(
        readonly _id: ObjectId,
        readonly group: QueueGroup,
        readonly status: QueueStatus,
        readonly run_at: Date,
        readonly max_count_try: number,
        readonly last_tried_at: Date | null,
        readonly count_tried: number,
        readonly results: string[]
    ) {
        // todo validation
    }
}

namespace Queue {
    /**
     * オーソリ解除キュー
     *
     *
     * @class CancelAuthorizationQueue
     * @extends {Queue}
     * @template T
     */
    // tslint:disable-next-line:max-classes-per-file
    export class CancelAuthorizationQueue<T extends Authorization> extends Queue {
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
        constructor(
            readonly _id: ObjectId,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly authorization: T
        ) {
            super(
                _id,
                QueueGroup.CANCEL_AUTHORIZATION,
                status,
                run_at,
                max_count_try,
                last_tried_at,
                count_tried,
                results
            );

            // todo validation
        }
    }

    /**
     * 取引照会無効化キュー
     *
     *
     * @class DisableTransactionInquiryQueue
     * @extends {Queue}
     */
    // tslint:disable-next-line:max-classes-per-file
    export class DisableTransactionInquiryQueue extends Queue {
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
        constructor(
            readonly _id: ObjectId,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly transaction_id: ObjectId
        ) {
            super(
                _id,
                QueueGroup.DISABLE_TRANSACTION_INQUIRY,
                status,
                run_at,
                max_count_try,
                last_tried_at,
                count_tried,
                results
            );

            // todo validation
        }
    }

    /**
     * プッシュ通知キュー
     *
     *
     * @class PushNotificationQueue
     * @extends {Queue}
     * @template T
     */
    // tslint:disable-next-line:max-classes-per-file
    export class PushNotificationQueue<T extends Notification> extends Queue {
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
        constructor(
            readonly _id: ObjectId,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly notification: T
        ) {
            super(
                _id,
                QueueGroup.PUSH_NOTIFICATION,
                status,
                run_at,
                max_count_try,
                last_tried_at,
                count_tried,
                results
            );

            // todo validation
        }
    }

    /**
     * 資産移動キュー
     *
     *
     * @class SettleAuthorizationQueue
     * @extends {Queue}
     * @template T
     */
    // tslint:disable-next-line:max-classes-per-file
    export class SettleAuthorizationQueue<T extends Authorization> extends Queue {
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
        constructor(
            readonly _id: ObjectId,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly authorization: T
        ) {
            super(
                _id,
                QueueGroup.SETTLE_AUTHORIZATION,
                status,
                run_at,
                max_count_try,
                last_tried_at,
                count_tried,
                results
            );

            // todo validation
        }
    }

    export function createSettleAuthorization<T extends Authorization>(args: {
        _id: ObjectId,
        authorization: T,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new SettleAuthorizationQueue<T>(
            args._id,
            args.status,
            args.run_at,
            args.max_count_try,
            args.last_tried_at,
            args.count_tried,
            args.results,
            args.authorization
        );
    }

    export function createCancelAuthorization<T extends Authorization>(args: {
        _id: ObjectId,
        authorization: T,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new CancelAuthorizationQueue<T>(
            args._id,
            args.status,
            args.run_at,
            args.max_count_try,
            args.last_tried_at,
            args.count_tried,
            args.results,
            args.authorization
        );
    }

    export function createPushNotification<T extends Notification>(args: {
        _id: ObjectId,
        notification: T,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new PushNotificationQueue<T>(
            args._id,
            args.status,
            args.run_at,
            args.max_count_try,
            args.last_tried_at,
            args.count_tried,
            args.results,
            args.notification
        );
    }

    export function createDisableTransactionInquiry(args: {
        _id: ObjectId,
        transaction_id: ObjectId,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new DisableTransactionInquiryQueue(
            args._id,
            args.status,
            args.run_at,
            args.max_count_try,
            args.last_tried_at,
            args.count_tried,
            args.results,
            args.transaction_id
        );
    }
}

export default Queue;
