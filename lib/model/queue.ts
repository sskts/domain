// tslint:disable:variable-name
import Authorization from '../model/authorization';
import Notification from '../model/notification';
import Transaction from '../model/transaction';
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
class Queue {
    constructor(
        readonly id: string,
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
        constructor(
            readonly id: string,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly authorization: T
        ) {
            super(
                id,
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
        constructor(
            readonly id: string,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly transaction: Transaction
        ) {
            super(
                id,
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
        constructor(
            readonly id: string,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly notification: T
        ) {
            super(
                id,
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
        constructor(
            readonly id: string,
            readonly status: QueueStatus,
            readonly run_at: Date,
            readonly max_count_try: number,
            readonly last_tried_at: Date | null,
            readonly count_tried: number,
            readonly results: string[],
            readonly authorization: T
        ) {
            super(
                id,
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

    export interface IQueue {
        id: string;
        group: QueueGroup;
        status: QueueStatus;
        run_at: Date;
        max_count_try: number;
        last_tried_at: Date | null;
        count_tried: number;
        results: string[];
    }

    export function create(args: IQueue) {
        return new Queue(
            args.id,
            args.group,
            args.status,
            args.run_at,
            args.max_count_try,
            args.last_tried_at,
            args.count_tried,
            args.results
        );
    }

    export function createSettleAuthorization<T extends Authorization>(args: {
        id: string,
        authorization: T,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new SettleAuthorizationQueue<T>(
            args.id,
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
        id: string,
        authorization: T,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new CancelAuthorizationQueue<T>(
            args.id,
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
        id: string,
        notification: T,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new PushNotificationQueue<T>(
            args.id,
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
        id: string,
        transaction: Transaction,
        status: QueueStatus,
        run_at: Date,
        max_count_try: number,
        last_tried_at: Date | null,
        count_tried: number,
        results: string[]
    }) {
        return new DisableTransactionInquiryQueue(
            args.id,
            args.status,
            args.run_at,
            args.max_count_try,
            args.last_tried_at,
            args.count_tried,
            args.results,
            args.transaction
        );
    }
}

export default Queue;
