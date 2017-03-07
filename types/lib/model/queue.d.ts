/**
 * キューファクトリー
 * キュー(実行日時つきのタスク)
 *
 * @namespace QueueFacroty
 */
import * as Authorization from '../model/authorization';
import * as Notification from '../model/notification';
import * as Transaction from '../model/transaction';
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
export declare function create(args: {
    id?: string;
    group: QueueGroup;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): IQueue;
export declare function createSettleAuthorization<T extends Authorization.IAuthorization>(args: {
    id?: string;
    authorization: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): ISettleAuthorizationQueue<T>;
export declare function createCancelAuthorization<T extends Authorization.IAuthorization>(args: {
    id?: string;
    authorization: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): ICancelAuthorizationQueue<T>;
export declare function createPushNotification<T extends Notification.INotification>(args: {
    id?: string;
    notification: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): IPushNotificationQueue<T>;
export declare function createDisableTransactionInquiry(args: {
    id?: string;
    transaction: Transaction.ITransaction;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): IDisableTransactionInquiryQueue;
