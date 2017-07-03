import GMONotificationAdapter from '../adapter/gmoNotification';
import TaskAdapter from '../adapter/task';
import TelemetryAdapter from '../adapter/telemetry';
import TransactionAdapter from '../adapter/transaction';
export declare type TaskAndTransactionOperation<T> = (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type TaskAndTelemetryAndTransactionOperation<T> = (taskAdapter: TaskAdapter, telemetryAdapter: TelemetryAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
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
         * 最大金額
         */
        maxAmount: number;
        /**
         * 最小金額
         */
        minAmount: number;
    };
    tasks: {
        /**
         * 集計期間中に作成されたキュー数
         */
        numberOfCreated: number;
        /**
         * 集計期間中に実行されたキュー数
         */
        numberOfExecuted: number;
        /**
         * 集計期間中に中止されたキュー数
         */
        numberOfAborted: number;
        /**
         * 合計待ち時間
         */
        totalLatencyInMilliseconds: number;
        /**
         * 最大待ち時間
         */
        maxLatencyInMilliseconds: number;
        /**
         * 最小待ち時間
         */
        minLatencyInMilliseconds: number;
        /**
         * 合計試行回数
         */
        totalNumberOfTrials: number;
        /**
         * 最大試行回数
         */
        maxNumberOfTrials: number;
        /**
         * 最小試行回数
         */
        minNumberOfTrials: number;
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
    tasks: {
        numberOfUnexecuted: number;
    };
    measured_at: Date;
}
export interface ITelemetry {
    flow: IFlow;
    stock: IStock;
}
/**
 * 測定データを作成する
 *
 * @returns {TaskAndTelemetryAndTransactionOperation<void>}
 * @memberof service/report
 */
export declare function createTelemetry(): TaskAndTelemetryAndTransactionOperation<void>;
/**
 * フロー計測データーを作成する
 *
 * @param {Date} measuredFrom 計測開始日時
 * @param {Date} measuredTo 計測終了日時
 * @returns {TaskAndTransactionOperation<IFlow>}
 */
export declare function createFlowTelemetry(measuredFrom: Date, measuredTo: Date): TaskAndTransactionOperation<IFlow>;
/**
 * ストック計測データを作成する
 *
 * @param {Date} measuredAt 計測日時
 * @returns {QueueAndTransactionOperation<IStock>}
 */
export declare function createStockTelemetry(measuredAt: Date): TaskAndTransactionOperation<IStock>;
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
