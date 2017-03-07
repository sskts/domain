/**
 * キューファクトリー
 * キュー(実行日時つきのタスク)
 *
 * @namespace QueueFacroty
 */
import * as Authorization from '../model/authorization';
import * as Notification from '../model/notification';
import * as Transaction from '../model/transaction';
import ObjectId from './objectId';
import QueueGroup from './queueGroup';
import QueueStatus from './queueStatus';

/**
 * キューインターフェース
 *
 * @export
 * @interface IQueue
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

/**
 * オーソリ解除キュー
 *
 * @param {T} authorization
 */
export interface ICancelAuthorizationQueue<T extends Authorization.IAuthorization> extends IQueue {
    authorization: T;
}

/**
 * 取引照会無効化キュー
 */
export interface IDisableTransactionInquiryQueue extends IQueue {
    transaction: Transaction.ITransaction;
}

/**
 * プッシュ通知キュー
 *
 * @param {T} notification
 */
export interface IPushNotificationQueue<T extends Notification.INotification> extends IQueue {
    notification: T;
}

/**
 * 資産移動キュー
 *
 * @param {T} authorization
 */
export interface ISettleAuthorizationQueue<T extends Authorization.IAuthorization> extends IQueue {
    authorization: T;
}

export function create(args: {
    id?: string;
    group: QueueGroup;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): IQueue {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: args.group,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results
    };
}

export function createSettleAuthorization<T extends Authorization.IAuthorization>(args: {
    id?: string,
    authorization: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: string[]
}): ISettleAuthorizationQueue<T> {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: QueueGroup.SETTLE_AUTHORIZATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        authorization: args.authorization
    };
}

export function createCancelAuthorization<T extends Authorization.IAuthorization>(args: {
    id?: string,
    authorization: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: string[]
}): ICancelAuthorizationQueue<T> {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: QueueGroup.CANCEL_AUTHORIZATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        authorization: args.authorization
    };
}

export function createPushNotification<T extends Notification.INotification>(args: {
    id?: string,
    notification: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: string[]
}): IPushNotificationQueue<T> {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: QueueGroup.PUSH_NOTIFICATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        notification: args.notification
    };
}

export function createDisableTransactionInquiry(args: {
    id?: string,
    transaction: Transaction.ITransaction,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: string[]
}): IDisableTransactionInquiryQueue {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: QueueGroup.DISABLE_TRANSACTION_INQUIRY,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        transaction: args.transaction
    };
}
