/**
 * レポートサービス
 * 実験的実装中
 * @namespace service.report
 */

import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

import { MongoRepository as AuthorizeActionRepo } from '../repo/action/authorize';
import { MongoRepository as GMONotificationRepo } from '../repo/gmoNotification';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TelemetryRepo } from '../repo/telemetry';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

export type TaskAndTransactionOperation<T> =
    (taskRepo: TaskRepo, transactionRep: TransactionRepo) => Promise<T>;
export type TaskAndTransactionAndAuthorizeActionOperation<T> =
    (taskRepo: TaskRepo, transactionRep: TransactionRepo, authorizeActionRepo: AuthorizeActionRepo) => Promise<T>;
export type TaskAndTelemetryAndTransactionOperation<T> = (
    taskRepo: TaskRepo,
    telemetryRepo: TelemetryRepo,
    transactionRep: TransactionRepo,
    authorizeActionRepo: AuthorizeActionRepo
) => Promise<T>;
export type GMONotificationOperation<T> = (gmoNotificationRepository: GMONotificationRepo) => Promise<T>;
export type IGMOResultNotification = GMO.factory.resultNotification.creditCard.IResultNotification;

const debug = createDebug('sskts-domain:service:report');
const TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS = 60; // 測定単位時間(秒)

/**
 * フローデータ
 * @export
 * @interface IFlow
 * @memberof service.report
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
        numberOfConfirmed: number;
        /**
         * 集計期間中に期限切れになった取引数
         */
        numberOfExpired: number;
        /**
         * クレジットカード決済数
         */
        numberOfPaymentCreditCard: number;
        /**
         * ムビチケ割引数
         */
        numberOfDiscountMvtk: number;
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
         * 取引の平均所要時間(ミリ秒)
         */
        averageRequiredTimeInMilliseconds: number;
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
        /**
         * 平均金額
         */
        averageAmount: number;
        /**
         * アクション数合計値(成立取引)
         */
        totalNumberOfActionsOnConfirmed: number;
        /**
         * 最大アクション数(成立取引)
         */
        maxNumberOfActionsOnConfirmed: number;
        /**
         * 最小アクション数(成立取引)
         */
        minNumberOfActionsOnConfirmed: number;
        /**
         * 平均アクション数(成立取引)
         */
        averageNumberOfActionsOnConfirmed: number;
        /**
         * アクション数合計値(期限切れ取引)
         */
        totalNumberOfActionsOnExpired: number;
        /**
         * 最大アクション数(期限切れ取引)
         */
        maxNumberOfActionsOnExpired: number;
        /**
         * 最小アクション数(期限切れ取引)
         */
        minNumberOfActionsOnExpired: number;
        /**
         * 平均アクション数(期限切れ取引)
         */
        averageNumberOfActionsOnExpired: number;
        /**
         * 注文アイテム数合計値
         */
        totalNumberOfOrderItems: number;
        /**
         * 最大注文アイテム数
         */
        maxNumberOfOrderItems: number;
        /**
         * 最小注文アイテム数
         */
        minNumberOfOrderItems: number;
        /**
         * 平均注文アイテム数
         */
        averageNumberOfOrderItems: number;
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
 * @memberof service.report
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
 * @memberof service.report
 * @param {Date} searchConditions.measuredFrom 計測日時from
 * @param {Date} searchConditions.measuredThrough 計測日時through
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
export function createTelemetry(measuredAt: Date): TaskAndTelemetryAndTransactionOperation<void> {
    return async (
        taskRepo: TaskRepo,
        telemetryRepo: TelemetryRepo,
        transactionRep: TransactionRepo,
        authorizeActionRepository: AuthorizeActionRepo
    ) => {
        const measuredThrough = moment(measuredAt);
        const measuredFrom = moment(measuredThrough).add(-TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS, 'seconds');

        const flowData = await createFlowTelemetry(measuredFrom.toDate(), measuredThrough.toDate())(
            taskRepo, transactionRep, authorizeActionRepository
        );
        debug('flowData created.', flowData);
        const stockData = await createStockTelemetry(measuredAt)(taskRepo, transactionRep);
        debug('stockData created.', stockData);

        const telemetry: ITelemetry = {
            flow: flowData,
            stock: stockData
        };
        await telemetryRepo.telemetryModel.create(telemetry);
        debug('telemetry saved.', telemetry);
    };
}

/**
 * フロー計測データーを作成する
 * @export
 * @function
 * @memberof service.report
 * @param {Date} measuredFrom 計測開始日時
 * @param {Date} measuredThrough 計測終了日時
 * @returns {TaskAndTransactionAndAuthorizeActionOperation<IFlow>}
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function createFlowTelemetry(measuredFrom: Date, measuredThrough: Date): TaskAndTransactionAndAuthorizeActionOperation<IFlow> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        taskRepo: TaskRepo,
        transactionRep: TransactionRepo,
        authorizeActionRepo: AuthorizeActionRepo
    ) => {
        // 直近{TELEMETRY_UNIT_TIME_IN_SECONDS}秒に開始された取引数を算出する
        const numberOfTransactionsStarted = await transactionRep.transactionModel.count({
            startDate: {
                $gte: measuredFrom,
                $lt: measuredThrough
            }
        }).exec();

        const endedTransactions = await transactionRep.transactionModel.find(
            {
                endDate: {
                    $gte: measuredFrom,
                    $lt: measuredThrough
                }
            },
            'status startDate endDate object result.order'
        ).exec().then((docs) => docs.map((doc) => <factory.transaction.placeOrder.ITransaction>doc.toObject()));
        debug('endedTransactions:', endedTransactions);

        const confirmedTransactions = endedTransactions.filter(
            (transaction) => transaction.status === factory.transactionStatusType.Confirmed
        );
        const expiredTransactions = endedTransactions.filter(
            (transaction) => transaction.status === factory.transactionStatusType.Expired
        );

        const numberOfTransactionsConfirmed = confirmedTransactions.length;

        // 所要時間算出(期間の成立取引リストを取得し、開始時刻と成立時刻の差を所要時間とする)
        const requiredTimesConfirmed = confirmedTransactions.map(
            (transaction) => moment(transaction.endDate).diff(moment(transaction.startDate, 'milliseconds'))
        );
        const totalRequiredTimeInMilliseconds = requiredTimesConfirmed.reduce((a, b) => a + b, 0);
        const maxRequiredTimeInMilliseconds = requiredTimesConfirmed.reduce((a, b) => Math.max(a, b), 0);
        const minRequiredTimeInMilliseconds =
            requiredTimesConfirmed.reduce((a, b) => Math.min(a, b), (numberOfTransactionsConfirmed > 0) ? requiredTimesConfirmed[0] : 0);
        const averageRequiredTimeInMilliseconds =
            (numberOfTransactionsConfirmed > 0) ? totalRequiredTimeInMilliseconds / numberOfTransactionsConfirmed : 0;

        // 金額算出
        const amounts = confirmedTransactions.map(
            (transaction) => (<factory.transaction.placeOrder.IResult>transaction.result).order.price
        );
        const totalAmount = amounts.reduce((a, b) => a + b, 0);
        const maxAmount = amounts.reduce((a, b) => Math.max(a, b), 0);
        const minAmount = amounts.reduce((a, b) => Math.min(a, b), (numberOfTransactionsConfirmed > 0) ? amounts[0] : 0);
        const averageAmount = (numberOfTransactionsConfirmed > 0) ? totalAmount / numberOfTransactionsConfirmed : 0;

        // アクション数集計
        const numbersOfActions = confirmedTransactions.map(
            (transaction) => (<factory.transaction.placeOrder.IObject>transaction.object).authorizeActions.length
        );
        const totalNumberOfActions = numbersOfActions.reduce((a, b) => a + b, 0);
        const maxNumberOfActions = numbersOfActions.reduce((a, b) => Math.max(a, b), 0);
        const minNumberOfActions = numbersOfActions.reduce(
            (a, b) => Math.min(a, b), (numberOfTransactionsConfirmed > 0) ? numbersOfActions[0] : 0
        );
        const averageNumberOfActions = (numberOfTransactionsConfirmed > 0) ? totalNumberOfActions / numberOfTransactionsConfirmed : 0;

        // 期限切れ取引数
        const numberOfTransactionsExpired = expiredTransactions.length;
        const expiredTransactionIds = expiredTransactions.map((transaction) => transaction.id);

        // 期限切れ取引に対して作成されたアクションを取得
        const actionsOnExpiredTransactions = await authorizeActionRepo.actionModel.find(
            {
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': { $in: expiredTransactionIds }
            },
            '_id object.transactionId'
        ).exec().then((docs) => docs.map((doc) => <factory.action.authorize.IAction>doc.toObject()));
        const numbersOfActionsOnExpired = expiredTransactionIds.map((transactionId) => {
            return actionsOnExpiredTransactions.filter((action) => action.object.transactionId === transactionId).length;
        });
        const totalNumberOfActionsOnExpired = numbersOfActionsOnExpired.reduce((a, b) => a + b, 0);
        const maxNumberOfActionsOnExpired = numbersOfActionsOnExpired.reduce((a, b) => Math.max(a, b), 0);
        const minNumberOfActionsOnExpired = numbersOfActionsOnExpired.reduce(
            (a, b) => Math.min(a, b), (numberOfTransactionsExpired > 0) ? numbersOfActionsOnExpired[0] : 0
        );
        const averageNumberOfActionsOnExpired =
            (numberOfTransactionsExpired > 0) ? totalNumberOfActionsOnExpired / numberOfTransactionsExpired : 0;

        const numberOfTasksCreated = await taskRepo.taskModel.count({
            createdAt: {
                $gte: measuredFrom,
                $lt: measuredThrough
            }
        }).exec();

        // 実行中止ステータスで、最終試行日時が範囲にあるものを実行タスク数とする
        const numberOfTasksAborted = await taskRepo.taskModel.count({
            lastTriedAt: {
                $gte: measuredFrom,
                $lt: measuredThrough
            },
            status: factory.taskStatus.Aborted
        }).exec();

        // 実行済みステータスで、最終試行日時が範囲にあるものを実行タスク数とする
        const executedTasks = await taskRepo.taskModel.find(
            {
                lastTriedAt: {
                    $gte: measuredFrom,
                    $lt: measuredThrough
                },
                status: factory.taskStatus.Executed
            },
            'runsAt lastTriedAt numberOfTried'
        ).exec().then((docs) => docs.map((doc) => <factory.task.ITask>doc.toObject()));
        const numberOfTasksExecuted = executedTasks.length;

        const latencies = executedTasks.map((task) => moment(<Date>task.lastTriedAt).diff(moment(task.runsAt, 'milliseconds')));
        const totalLatency = latencies.reduce((a, b) => a + b, 0);
        const maxLatency = latencies.reduce((a, b) => Math.max(a, b), 0);
        const minLatency = latencies.reduce((a, b) => Math.min(a, b), (numberOfTasksExecuted > 0) ? latencies[0] : 0);

        const numbersOfTrials = await Promise.all(executedTasks.map((task) => task.numberOfTried));
        const totalNumberOfTrials = numbersOfTrials.reduce((a, b) => a + b, 0);
        const maxNumberOfTrials = numbersOfTrials.reduce((a, b) => Math.max(a, b), 0);
        const minNumberOfTrials = numbersOfTrials.reduce((a, b) => Math.min(a, b), (numberOfTasksExecuted > 0) ? numbersOfTrials[0] : 0);

        return {
            transactions: {
                numberOfStarted: numberOfTransactionsStarted,
                numberOfConfirmed: numberOfTransactionsConfirmed,
                numberOfExpired: numberOfTransactionsExpired,
                // tslint:disable-next-line:no-suspicious-comment
                numberOfPaymentCreditCard: 0, // TODO 実装
                // tslint:disable-next-line:no-suspicious-comment
                numberOfDiscountMvtk: 0, // TODO 実装
                totalRequiredTimeInMilliseconds: totalRequiredTimeInMilliseconds,
                maxRequiredTimeInMilliseconds: maxRequiredTimeInMilliseconds,
                minRequiredTimeInMilliseconds: minRequiredTimeInMilliseconds,
                averageRequiredTimeInMilliseconds: parseFloat(averageRequiredTimeInMilliseconds.toFixed(1)),
                totalAmount: totalAmount,
                maxAmount: maxAmount,
                minAmount: minAmount,
                averageAmount: parseFloat(averageAmount.toFixed(1)),
                totalNumberOfActionsOnConfirmed: totalNumberOfActions,
                maxNumberOfActionsOnConfirmed: maxNumberOfActions,
                minNumberOfActionsOnConfirmed: minNumberOfActions,
                averageNumberOfActionsOnConfirmed: parseFloat(averageNumberOfActions.toFixed(1)),
                totalNumberOfActionsOnExpired: totalNumberOfActionsOnExpired,
                maxNumberOfActionsOnExpired: maxNumberOfActionsOnExpired,
                minNumberOfActionsOnExpired: minNumberOfActionsOnExpired,
                averageNumberOfActionsOnExpired: parseFloat(averageNumberOfActionsOnExpired.toFixed(1)),
                // tslint:disable-next-line:no-suspicious-comment
                totalNumberOfOrderItems: 0, // TODO 実装
                // tslint:disable-next-line:no-suspicious-comment
                maxNumberOfOrderItems: 0, // TODO 実装
                // tslint:disable-next-line:no-suspicious-comment
                minNumberOfOrderItems: 0, // TODO 実装
                // tslint:disable-next-line:no-suspicious-comment
                averageNumberOfOrderItems: 0 // TODO 実装
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
 * @memberof service.report
 * @param {Date} measuredAt 計測日時
 * @returns {TaskAndTransactionAndAuthorizeActionOperation<IStock>}
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function createStockTelemetry(measuredAt: Date): TaskAndTransactionOperation<IStock> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        taskRepo: TaskRepo,
        transactionRep: TransactionRepo
    ) => {
        const numberOfTransactionsUnderway = await transactionRep.transactionModel.count({
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

        const numberOfTasksUnexecuted = await taskRepo.taskModel.count({
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

/**
 * GMO売上健康診断レポートインターフェース
 * @export
 * @interface
 * @memberof service.report
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
 * @memberof service.report
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
 * @memberof service.report
 */
export function checkHealthOfGMOSales(madeFrom: Date, madeThrough: Date) {
    return async (gmoNotificationRepo: GMONotificationRepo, transactionRepo: TransactionRepo): Promise<IReportOfGMOSalesHealthCheck> => {
        const sales = await gmoNotificationRepo.searchSales({
            tranDateFrom: madeFrom,
            tranDateThrough: madeThrough
        });
        debug('sales:', sales);

        const totalAmount = sales.reduce((a, b) => a + b.amount, 0);

        // オーダーIDごとに有効性確認すると、コマンド過多でMongoDBにある程度の負荷をかけてしまう
        // まとめて検索してから、ローカルで有効性を確認する必要がある
        const orderIds = sales.map((sale) => sale.orderId);

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
        sales.forEach((gmoSale) => {
            try {
                // オーダーIDに該当する取引がなければエラー
                const transactionByOrderId = transactions.find((transaction) => {
                    const authorizeActionByOrderId = transaction.object.authorizeActions.find(
                        (authorizeAction: factory.action.authorize.creditCard.IAction) => {
                            return authorizeAction.object.orderId === gmoSale.orderId;
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
                            return authorizeAction.object.orderId === gmoSale.orderId;
                        }
                    );
                debug('creditCardAuthorizeAction is', creditCardAuthorizeAction);

                const authorizeActionResult = <factory.action.authorize.creditCard.IResult>creditCardAuthorizeAction.result;
                if (authorizeActionResult.execTranArgs.accessId !== gmoSale.accessId) {
                    throw new Error('accessId not matched');
                }

                if (creditCardAuthorizeAction.object.payType !== gmoSale.payType) {
                    throw new Error('payType not matched');
                }

                // オーソリの金額と同一かどうか
                if (creditCardAuthorizeAction.object.amount !== gmoSale.amount) {
                    throw new Error('amount not matched');
                }
            } catch (error) {
                errors.push({
                    orderId: gmoSale.orderId,
                    amount: gmoSale.amount,
                    reason: error.message
                });
            }
        });

        return {
            madeFrom: madeFrom,
            madeThrough: madeThrough,
            numberOfSales: sales.length,
            totalAmount: totalAmount,
            totalAmountCurrency: factory.priceCurrency.JPY,
            unhealthGMOSales: errors
        };
    };
}
