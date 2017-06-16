import GMONotificationAdapter from '../adapter/gmoNotification';
import QueueAdapter from '../adapter/queue';
import TelemetryAdapter from '../adapter/telemetry';
import TransactionAdapter from '../adapter/transaction';
export declare type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type QueueAndTelemetryAndTransactionOperation<T> = (queueAdapter: QueueAdapter, telemetryAdapter: TelemetryAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type GMONotificationOperation<T> = (gmoNotificationAdapter: GMONotificationAdapter) => Promise<T>;
/**
 * フローデータ
 *
 * @interface IFlow
 * @see https://en.wikipedia.org/wiki/Stock_and_flow
 */
export interface IFlow {
    transactions: {
        /**
         * 集計期間中に開始された取引数
         */
        numberOfStarted: number;
        /**
         * 集計期間中に成立した取引数
         */
        numberOfClosed: number;
        /**
         * 集計期間中に期限切れになった取引数
         */
        numberOfExpired: number;
        /**
         * 取引の合計所要時間(ミリ秒)
         */
        totalRequiredTimeInMilliseconds: number;
        /**
         * 取引の最大所要時間(ミリ秒)
         */
        maxRequiredTimeInMilliseconds: number;
        /**
         * 取引の最小所要時間(ミリ秒)
         */
        minRequiredTimeInMilliseconds: number;
        /**
         * 取引の合計金額(yen)
         */
        totalAmount: number;
        /**
         * 取引の合計金額(yen)
         */
        maxAmount: number;
        /**
         * 取引の合計金額(yen)
         */
        minAmount: number;
    };
    queues: {
        /**
         * 集計期間中に作成されたキュー数
         */
        numberOfCreated: number;
    };
    measured_from: Date;
    measured_to: Date;
}
/**
 * ストックデータ
 *
 * @interface IStock
 * @see https://en.wikipedia.org/wiki/Stock_and_flow
 */
export interface IStock {
    transactions: {
        numberOfUnderway: number;
    };
    queues: {
        numberOfUnexecuted: number;
    };
    measured_at: Date;
}
export interface ITelemetry {
    flow: IFlow;
    stock: IStock;
}
export interface IReportTransactionStatuses {
    numberOfTransactionsUnderway: number;
    numberOfTransactionsClosedWithQueuesUnexported: number;
    numberOfTransactionsExpiredWithQueuesUnexported: number;
    numberOfQueuesUnexecuted: number;
}
/**
 * 測定データを作成する
 *
 * @returns {QueueAndTelemetryAndTransactionOperation<void>}
 * @memberof service/report
 */
export declare function createTelemetry(): QueueAndTelemetryAndTransactionOperation<void>;
/**
 * 状態ごとの取引数を算出する
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
export declare function transactionStatuses(): QueueAndTransactionOperation<IReportTransactionStatuses>;
/**
 * カード決済GMO通知インターフェース
 * todo そのうち仕様が固まってきたらfactoryに移動
 */
export interface ICreditGMONotification {
    shop_id: string;
    access_id: string;
    order_id: string;
    status: string;
    job_cd: string;
    amount: string;
    tax: string;
    currency: string;
    forward: string;
    method: string;
    pay_times: string;
    tran_id: string;
    approve: string;
    tran_date: string;
    err_code: string;
    err_info: string;
    pay_type: string;
}
/**
 * GMO実売上検索
 * todo webhookで失敗した場合に通知は重複して入ってくる
 * そのケースをどう対処するか
 *
 * @memberof service/report
 */
export declare function searchGMOSales(dateFrom: Date, dateTo: Date): GMONotificationOperation<ICreditGMONotification[]>;
/**
 * GMO実売上を診察にかける
 *
 * @param {ICreditGMONotification} notification GMOクレジットカード通知
 */
export declare function examineGMOSales(notification: ICreditGMONotification): (transactionAdapter: TransactionAdapter) => Promise<void>;
