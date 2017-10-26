/**
 * レポートサービス
 * 実験的実装中
 * @namespace service.report
 */

import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
// tslint:disable-next-line:no-require-imports no-var-requires
require('moment-timezone');

import { MongoRepository as GMONotificationRepo } from '../repo/gmoNotification';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TelemetryRepo } from '../repo/telemetry';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

export type TaskAndTransactionOperation<T> = (taskRepository: TaskRepo, transactionRepository: TransactionRepo) => Promise<T>;
export type TaskAndTelemetryAndTransactionOperation<T> =
    (taskRepository: TaskRepo, telemetryRepository: TelemetryRepo, transactionRepository: TransactionRepo) => Promise<T>;
export type GMONotificationOperation<T> = (gmoNotificationRepository: GMONotificationRepo) => Promise<T>;

const debug = createDebug('sskts-domain:service:report');
const TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS = 60; // 測定単位時間(秒)

/**
 * フローデータ
 * @export
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
         * 集計期間中に作成されたタスク数
         */
        numberOfCreated: number;
        /**
         * 集計期間中に実行されたタスク数
         */
        numberOfExecuted: number;
        /**
         * 集計期間中に中止されたタスク数
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
    measuredFrom: Date;
    measuredThrough: Date;
}

/**
 * ストックデータ
 * @export
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
    measuredAt: Date;
}

export interface ITelemetry {
    flow: IFlow;
    stock: IStock;
}

/**
 * 計測データを検索する
 * @export
 * @function
 * @param searchConditions 検索条件
 */
export function searchTelemetries(searchConditions: {
    measuredFrom: Date,
    measuredThrough: Date
}) {
    return async (telemetryRepo: TelemetryRepo) => {
        return <ITelemetry[]>await telemetryRepo.telemetryModel.find(
            {
                'stock.measuredAt': {
                    $gte: searchConditions.measuredFrom,
                    $lt: searchConditions.measuredThrough
                }
            }
        ).sort({ 'stock.measuredAt': 1 }).lean().exec();
    };
}

/**
 * 測定データを作成する
 * @export
 * @function
 * @returns {TaskAndTelemetryAndTransactionOperation<void>}
 * @memberof service.report
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function createTelemetry(): TaskAndTelemetryAndTransactionOperation<void> {
    return async (
        taskRepository: TaskRepo,
        telemetryRepository: TelemetryRepo,
        transactionRepository: TransactionRepo
    ) => {
        const dateNow = moment();
        const measuredThrough = moment.unix((dateNow.unix() - (dateNow.unix() % TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS)));
        const measuredFrom = moment(measuredThrough).add(-TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS, 'seconds');
        const measuredAt = moment(measuredThrough);

        const flowData = await createFlowTelemetry(measuredFrom.toDate(), measuredThrough.toDate())(taskRepository, transactionRepository);
        const stockData = await createStockTelemetry(measuredAt.toDate())(taskRepository, transactionRepository);

        const telemetry: ITelemetry = {
            flow: flowData,
            stock: stockData
        };
        await telemetryRepository.telemetryModel.create(telemetry);
        debug('telemetry created', telemetry);
    };
}

/**
 * フロー計測データーを作成する
 * @export
 * @function
 * @param {Date} measuredFrom 計測開始日時
 * @param {Date} measuredThrough 計測終了日時
 * @returns {TaskAndTransactionOperation<IFlow>}
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function createFlowTelemetry(measuredFrom: Date, measuredThrough: Date): TaskAndTransactionOperation<IFlow> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        taskRepository: TaskRepo,
        transactionRepository: TransactionRepo
    ) => {
        // 直近{TELEMETRY_UNIT_TIME_IN_SECONDS}秒に開始された取引数を算出する
        const numberOfTransactionsStarted = await transactionRepository.transactionModel.count({
            startDate: {
                $gte: measuredFrom,
                $lt: measuredThrough
            }
        }).exec();

        // 平均所要時間算出(期間の成立取引リストを取得し、開始時刻と成立時刻の差を所要時間とする)
        const closedTransactions = await transactionRepository.transactionModel.find(
            {
                endDate: {
                    $gte: measuredFrom,
                    $lt: measuredThrough
                },
                status: factory.transactionStatusType.Confirmed
            },
            'startDate endDate'
        ).exec();
        const numberOfTransactionsClosed = closedTransactions.length;
        const requiredTimes = closedTransactions.map(
            (transaction) => moment(transaction.get('endDate')).diff(moment(transaction.get('startDate'), 'milliseconds'))
        );
        const totalRequiredTimeInMilliseconds = requiredTimes.reduce((a, b) => a + b, 0);
        const maxRequiredTimeInMilliseconds = requiredTimes.reduce((a, b) => Math.max(a, b), 0);
        const minRequiredTimeInMilliseconds =
            requiredTimes.reduce((a, b) => Math.min(a, b), (numberOfTransactionsClosed > 0) ? requiredTimes[0] : 0);

        // todo 金額算出
        // const amounts = await Promise.all(
        //     closedTransactions.map(async (transaction) => await transactionRepository.calculateAmountById(transaction.get('id')))
        // );
        const amounts: number[] = [];
        const totalAmount = amounts.reduce((a, b) => a + b, 0);
        const maxAmount = amounts.reduce((a, b) => Math.max(a, b), 0);
        const minAmount = amounts.reduce((a, b) => Math.min(a, b), (numberOfTransactionsClosed > 0) ? amounts[0] : 0);

        const numberOfTransactionsExpired = await transactionRepository.transactionModel.count({
            endDate: {
                $gte: measuredFrom,
                $lt: measuredThrough
            },
            status: factory.transactionStatusType.Expired
        }).exec();

        const numberOfTasksCreated = await taskRepository.taskModel.count({
            createdAt: {
                $gte: measuredFrom,
                $lt: measuredThrough
            }
        }).exec();

        // 実行中止ステータスで、最終試行日時が範囲にあるものを実行タスク数とする
        const numberOfTasksAborted = await taskRepository.taskModel.count({
            lastTriedAt: {
                $gte: measuredFrom,
                $lt: measuredThrough
            },
            status: factory.taskStatus.Aborted
        }).exec();

        // 実行済みステータスで、最終試行日時が範囲にあるものを実行タスク数とする
        const executedTasks = await taskRepository.taskModel.find(
            {
                lastTriedAt: {
                    $gte: measuredFrom,
                    $lt: measuredThrough
                },
                status: factory.taskStatus.Executed
            },
            'runsAt lastTriedAt numberOfTried'
        ).exec();
        const numberOfTasksExecuted = executedTasks.length;

        const latencies = await Promise.all(
            executedTasks.map(
                (task) => moment(task.get('lastTriedAt')).diff(moment(task.get('runsAt'), 'milliseconds'))
            )
        );
        const totalLatency = latencies.reduce((a, b) => a + b, 0);
        const maxLatency = latencies.reduce((a, b) => Math.max(a, b), 0);
        const minLatency = latencies.reduce((a, b) => Math.min(a, b), (numberOfTasksExecuted > 0) ? latencies[0] : 0);

        const numbersOfTrials = await Promise.all(executedTasks.map((task) => <number>task.get('numberOfTried')));
        const totalNumberOfTrials = numbersOfTrials.reduce((a, b) => a + b, 0);
        const maxNumberOfTrials = numbersOfTrials.reduce((a, b) => Math.max(a, b), 0);
        const minNumberOfTrials = numbersOfTrials.reduce((a, b) => Math.min(a, b), (numberOfTasksExecuted > 0) ? numbersOfTrials[0] : 0);

        return {
            transactions: {
                numberOfStarted: numberOfTransactionsStarted,
                numberOfClosed: numberOfTransactionsClosed,
                numberOfExpired: numberOfTransactionsExpired,
                totalRequiredTimeInMilliseconds: totalRequiredTimeInMilliseconds,
                maxRequiredTimeInMilliseconds: maxRequiredTimeInMilliseconds,
                minRequiredTimeInMilliseconds: minRequiredTimeInMilliseconds,
                totalAmount: totalAmount,
                maxAmount: maxAmount,
                minAmount: minAmount
            },
            tasks: {
                numberOfCreated: numberOfTasksCreated,
                numberOfExecuted: numberOfTasksExecuted,
                numberOfAborted: numberOfTasksAborted,
                totalLatencyInMilliseconds: totalLatency,
                maxLatencyInMilliseconds: maxLatency,
                minLatencyInMilliseconds: minLatency,
                totalNumberOfTrials: totalNumberOfTrials,
                maxNumberOfTrials: maxNumberOfTrials,
                minNumberOfTrials: minNumberOfTrials
            },
            measuredFrom: measuredFrom,
            measuredThrough: measuredThrough
        };
    };
}

/**
 * ストック計測データを作成する
 * @export
 * @function
 * @param {Date} measuredAt 計測日時
 * @returns {TaskAndTransactionOperation<IStock>}
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function createStockTelemetry(measuredAt: Date): TaskAndTransactionOperation<IStock> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        taskRepository: TaskRepo,
        transactionRepository: TransactionRepo
    ) => {
        const numberOfTransactionsUnderway = await transactionRepository.transactionModel.count({
            $or: [
                // {measuredAt}以前に開始し、{measuredAt}以後に成立あるいは期限切れした取引
                {
                    startDate: {
                        $lte: measuredAt
                    },
                    endDate: {
                        $gt: measuredAt
                    }
                },
                // {measuredAt}以前に開始し、いまだに進行中の取引
                {
                    startDate: {
                        $lte: measuredAt
                    },
                    status: factory.transactionStatusType.InProgress
                }
            ]
        }).exec();

        const numberOfTasksUnexecuted = await taskRepository.taskModel.count({
            $or: [
                // {measuredAt}以前に作成され、{measuredAt}以後に実行試行されたタスク
                {
                    createdAt: {
                        $lte: measuredAt
                    },
                    lastTriedAt: {
                        $gt: measuredAt
                    }
                },
                // {measuredAt}以前に作成され、いまだに未実行のタスク
                {
                    createdAt: {
                        $lte: measuredAt
                    },
                    status: factory.taskStatus.Ready
                }
            ]
        }).exec();

        return {
            transactions: {
                numberOfUnderway: numberOfTransactionsUnderway
            },
            tasks: {
                numberOfUnexecuted: numberOfTasksUnexecuted
            },
            measuredAt: measuredAt
        };
    };
}

// tslint:disable-next-line:no-suspicious-comment
/**
 * カード決済GMO通知インターフェース
 * TODO そのうち仕様が固まってきたらfactoryに移動
 * @export
 * @interface
 */
export interface ICreditGMONotification {
    shop_id: string; // ショップID
    access_id: string; // 取引ID
    order_id: string; // オーダーID
    status: string; // 現状態
    job_cd: string; // 処理区分
    amount: string; // 利用金額
    tax: string; // 税送料
    currency: string; // 通貨コード
    forward: string; // 仕向先会社コード
    method: string; // 支払方法
    pay_times: string; // 支払回数
    tran_id: string; // トランザクションID
    approve: string; // 承認番号
    tran_date: string; // 処理日付
    err_code: string; // エラーコード
    err_info: string; // エラー詳細コード
    pay_type: string; // 決済方法
}

/**
 * GMO実売上検索
 * todo webhookで失敗した場合に通知は重複して入ってくる
 * そのケースをどう対処するか
 * @export
 * @function
 * @memberof service.report
 */
export function searchGMOSales(dateFrom: Date, dateTo: Date): GMONotificationOperation<ICreditGMONotification[]> {
    return async (gmoNotificationRepository: GMONotificationRepo) => {
        // 'tran_date': '20170415230109'の形式
        return <ICreditGMONotification[]>await gmoNotificationRepository.gmoNotificationModel.find(
            {
                job_cd: GMO.utils.util.JobCd.Sales,
                tran_date: {
                    $gte: moment(dateFrom).tz('Asia/Tokyo').format('YYYYMMDDHHmmss'),
                    $lte: moment(dateTo).tz('Asia/Tokyo').format('YYYYMMDDHHmmss')
                }
            }
        ).lean().exec();
    };
}

/**
 * GMO売上健康診断レポートインターフェース
 * @export
 * @interface
 */
export interface IReportOfGMOSalesHealthCheck {
    madeFrom: Date;
    madeThrough: Date;
    numberOfSales: number;
    totalAmount: number;
    totalAmountCurrency: factory.priceCurrency;
    unhealthGMOSales: IUnhealthGMOSale[];
}

/**
 * 不健康なGMO売上インターフェース
 * @export
 * @interface
 */
export interface IUnhealthGMOSale {
    orderId: string;
    amount: number;
    reason: string;
}

/**
 * 期間指定でGMO実売上の健康診断を実施する
 * @export
 * @function
 */
export function checkHealthOfGMOSales(madeFrom: Date, madeThrough: Date) {
    return async (gmoNotificationRepo: GMONotificationRepo, transactionRepo: TransactionRepo): Promise<IReportOfGMOSalesHealthCheck> => {
        const gmoSales = await searchGMOSales(madeFrom, madeThrough)(gmoNotificationRepo);
        debug('gmoSales:', gmoSales);

        // tslint:disable-next-line:no-magic-numbers
        const totalAmount = gmoSales.reduce((a, b) => a + parseInt(b.amount, 10), 0);

        // オーダーIDごとに有効性確認すると、コマンド過多でMongoDBにある程度の負荷をかけてしまう
        // まとめて検索してから、ローカルで有効性を確認する必要がある
        const orderIds = gmoSales.map((gmoSale) => gmoSale.order_id);

        // オーダーIDが承認アクションに含まれる注文取引を参照
        const transactions = <factory.transaction.placeOrder.ITransaction[]>await transactionRepo.transactionModel.find(
            {
                typeOf: factory.transactionType.PlaceOrder,
                status: factory.transactionStatusType.Confirmed,
                'object.authorizeActions.object.orderId': { $in: orderIds }
            }
        ).lean().exec();
        debug('transactions are', transactions);

        const errors: IUnhealthGMOSale[] = [];
        gmoSales.forEach((gmoSale) => {
            try {
                // オーダーIDに該当する取引がなければエラー
                const transactionByOrderId = transactions.find((transaction) => {
                    const authorizeActionByOrderId = transaction.object.authorizeActions.find(
                        (authorizeAction: factory.action.authorize.creditCard.IAction) => {
                            return authorizeAction.object.orderId === gmoSale.order_id;
                        }
                    );

                    return authorizeActionByOrderId !== undefined;
                });
                if (transactionByOrderId === undefined) {
                    throw new Error('transaction by orderId not found');
                }

                // アクセスIDが一致するかどうか
                const creditCardAuthorizeAction =
                    <factory.action.authorize.creditCard.IAction>transactionByOrderId.object.authorizeActions.find(
                        (authorizeAction: factory.action.authorize.creditCard.IAction) => {
                            return authorizeAction.object.orderId === gmoSale.order_id;
                        }
                    );
                debug('creditCardAuthorizeAction is', creditCardAuthorizeAction);

                const authorizeActionResult = <factory.action.authorize.creditCard.IResult>creditCardAuthorizeAction.result;
                if (authorizeActionResult.execTranArgs.accessId !== gmoSale.access_id) {
                    throw new Error('gmo_access_id not matched');
                }

                if (creditCardAuthorizeAction.object.payType !== gmoSale.pay_type) {
                    throw new Error('gmo_pay_type not matched');
                }

                // オーソリの金額と同一かどうか
                // tslint:disable-next-line:no-magic-numbers
                if (creditCardAuthorizeAction.object.amount !== parseInt(gmoSale.amount, 10)) {
                    throw new Error('amount not matched');
                }
            } catch (error) {
                errors.push({
                    orderId: gmoSale.order_id,
                    // tslint:disable-next-line:no-magic-numbers
                    amount: parseInt(gmoSale.amount, 10),
                    reason: error.message
                });
            }
        });

        return {
            madeFrom: madeFrom,
            madeThrough: madeThrough,
            numberOfSales: gmoSales.length,
            totalAmount: totalAmount,
            totalAmountCurrency: factory.priceCurrency.JPY,
            unhealthGMOSales: errors
        };
    };
}
