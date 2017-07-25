"use strict";
/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace service/report
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const moment = require("moment");
const taskStatus_1 = require("../factory/taskStatus");
const transactionStatusType_1 = require("../factory/transactionStatusType");
const debug = createDebug('sskts-domain:service:report');
const TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS = 60; // 測定単位時間(秒)
/**
 * 測定データを作成する
 *
 * @returns {TaskAndTelemetryAndTransactionOperation<void>}
 * @memberof service/report
 */
function createTelemetry() {
    return (taskAdapter, telemetryAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const dateNow = moment();
        const measuredTo = moment.unix((dateNow.unix() - (dateNow.unix() % TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS)));
        const measuredFrom = moment(measuredTo).add(-TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS, 'seconds');
        const measuredAt = moment(measuredTo);
        const flowData = yield createFlowTelemetry(measuredFrom.toDate(), measuredTo.toDate())(taskAdapter, transactionAdapter);
        const stockData = yield createStockTelemetry(measuredAt.toDate())(taskAdapter, transactionAdapter);
        const telemetry = {
            flow: flowData,
            stock: stockData
        };
        yield telemetryAdapter.telemetryModel.create(telemetry);
        debug('telemetry created', telemetry);
    });
}
exports.createTelemetry = createTelemetry;
/**
 * フロー計測データーを作成する
 *
 * @param {Date} measuredFrom 計測開始日時
 * @param {Date} measuredTo 計測終了日時
 * @returns {TaskAndTransactionOperation<IFlow>}
 */
function createFlowTelemetry(measuredFrom, measuredTo) {
    // tslint:disable-next-line:max-func-body-length
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 直近{TELEMETRY_UNIT_TIME_IN_SECONDS}秒に開始された取引数を算出する
        const numberOfTransactionsStarted = yield transactionAdapter.transactionModel.count({
            started_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            }
        }).exec();
        // 平均所要時間算出(期間の成立取引リストを取得し、開始時刻と成立時刻の差を所要時間とする)
        const closedTransactions = yield transactionAdapter.transactionModel.find({
            closed_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            }
        }, 'started_at closed_at').exec();
        const numberOfTransactionsClosed = closedTransactions.length;
        const requiredTimes = closedTransactions.map((transaction) => moment(transaction.get('closed_at')).diff(moment(transaction.get('started_at'), 'milliseconds')));
        const totalRequiredTimeInMilliseconds = requiredTimes.reduce((a, b) => a + b, 0);
        const maxRequiredTimeInMilliseconds = requiredTimes.reduce((a, b) => Math.max(a, b), 0);
        const minRequiredTimeInMilliseconds = requiredTimes.reduce((a, b) => Math.min(a, b), (numberOfTransactionsClosed > 0) ? requiredTimes[0] : 0);
        // todo 金額算出
        // const amounts = await Promise.all(
        //     closedTransactions.map(async (transaction) => await transactionAdapter.calculateAmountById(transaction.get('id')))
        // );
        const amounts = [];
        const totalAmount = amounts.reduce((a, b) => a + b, 0);
        const maxAmount = amounts.reduce((a, b) => Math.max(a, b), 0);
        const minAmount = amounts.reduce((a, b) => Math.min(a, b), (numberOfTransactionsClosed > 0) ? amounts[0] : 0);
        const numberOfTransactionsExpired = yield transactionAdapter.transactionModel.count({
            expired_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            }
        }).exec();
        const numberOfTasksCreated = yield taskAdapter.taskModel.count({
            createdAt: {
                $gte: measuredFrom,
                $lt: measuredTo
            }
        }).exec();
        // 実行中止ステータスで、最終試行日時が範囲にあるものを実行タスク数とする
        const numberOfTasksAborted = yield taskAdapter.taskModel.count({
            last_tried_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            },
            status: taskStatus_1.default.Aborted
        }).exec();
        // 実行済みステータスで、最終試行日時が範囲にあるものを実行タスク数とする
        const executedTasks = yield taskAdapter.taskModel.find({
            last_tried_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            },
            status: taskStatus_1.default.Executed
        }, 'runs_at last_tried_at number_of_tried').exec();
        const numberOfTasksExecuted = executedTasks.length;
        const latencies = yield Promise.all(executedTasks.map((task) => moment(task.get('last_tried_at')).diff(moment(task.get('runs_at'), 'milliseconds'))));
        const totalLatency = latencies.reduce((a, b) => a + b, 0);
        const maxLatency = latencies.reduce((a, b) => Math.max(a, b), 0);
        const minLatency = latencies.reduce((a, b) => Math.min(a, b), (numberOfTasksExecuted > 0) ? latencies[0] : 0);
        const numbersOfTrials = yield Promise.all(executedTasks.map((task) => task.get('number_of_tried')));
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
            measured_from: measuredFrom,
            measured_to: measuredTo
        };
    });
}
exports.createFlowTelemetry = createFlowTelemetry;
/**
 * ストック計測データを作成する
 *
 * @param {Date} measuredAt 計測日時
 * @returns {TaskAndTransactionOperation<IStock>}
 */
function createStockTelemetry(measuredAt) {
    // tslint:disable-next-line:max-func-body-length
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const numberOfTransactionsUnderway = yield transactionAdapter.transactionModel.count({
            $or: [
                // {measuredAt}以前に開始し、{measuredAt}以後に成立あるいは期限切れした取引
                {
                    started_at: {
                        $lte: measuredAt
                    },
                    $or: [
                        {
                            closed_at: {
                                $gt: measuredAt
                            }
                        },
                        {
                            expired_at: {
                                $gt: measuredAt
                            }
                        }
                    ]
                },
                // {measuredAt}以前に開始し、いまだに進行中の取引
                {
                    started_at: {
                        $lte: measuredAt
                    },
                    status: transactionStatusType_1.default.InProgress
                }
            ]
        }).exec();
        const numberOfTasksUnexecuted = yield taskAdapter.taskModel.count({
            $or: [
                // {measuredAt}以前に作成され、{measuredAt}以後に実行試行されたタスク
                {
                    createdAt: {
                        $lte: measuredAt
                    },
                    $or: [
                        {
                            last_tried_at: {
                                $gt: measuredAt
                            }
                        }
                    ]
                },
                // {measuredAt}以前に作成され、いまだに未実行のタスク
                {
                    createdAt: {
                        $lte: measuredAt
                    },
                    status: taskStatus_1.default.Ready
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
            measured_at: measuredAt
        };
    });
}
exports.createStockTelemetry = createStockTelemetry;
/**
 * GMO実売上検索
 * todo webhookで失敗した場合に通知は重複して入ってくる
 * そのケースをどう対処するか
 *
 * @memberof service/report
 */
function searchGMOSales(dateFrom, dateTo) {
    return (gmoNotificationAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 'tran_date': '20170415230109'の形式
        return yield gmoNotificationAdapter.gmoNotificationModel.find({
            job_cd: GMO.Util.JOB_CD_SALES,
            tran_date: {
                $gte: moment(dateFrom).format('YYYYMMDDHHmmss'),
                $lte: moment(dateTo).format('YYYYMMDDHHmmss')
            }
        }).lean().exec();
    });
}
exports.searchGMOSales = searchGMOSales;
/**
 * GMO実売上を診察にかける
 */
// export function examineGMOSales(notification: ICreditGMONotification) {
//     return async (transactionAdapter: TransactionAdapter) => {
//         if (notification.job_cd !== GMO.Util.JOB_CD_SALES) {
//             throw new ArgumentError('notification.job_cd', 'job_cd should be SALES');
//         }
//         if (!_.isEmpty(notification.err_code)) {
//             throw new Error(`err_code exists${notification.err_code}`);
//         }
//         // オーダーIDから劇場コードと予約番号を取得
//         // tslint:disable-next-line:no-magic-numbers
//         const theaterCode = notification.order_id.slice(8, 11);
//         // tslint:disable-next-line:no-magic-numbers
//         const reserveNum = parseInt(notification.order_id.slice(11, 19), 10);
//         debug('theaterCode, reserveNum:', theaterCode, reserveNum);
//         if (typeof theaterCode !== 'string' || !Number.isInteger(reserveNum)) {
//             throw new Error('invalid orderId');
//         }
//         const transactionDoc = await transactionAdapter.transactionModel.findOne(
//             {
//                 status: TransactionStatus.CLOSED,
//                 'inquiry_key.theater_code': theaterCode,
//                 'inquiry_key.reserve_num': reserveNum
//             },
//             '_id'
//         ).exec();
//         debug('transactionDoc:', transactionDoc);
//         if (transactionDoc === null) {
//             throw new Error('transaction not found');
//         }
//         const authorizations = await transactionAdapter.findAuthorizationsById(transactionDoc.get('id'));
//         const gmoAuthorization = <GMOAuthorizationFactory.IAuthorization>authorizations.find(
//             (authorization) => authorization.group === AuthorizationGroup.GMO
//         );
//         // GMOオーソリがなければ異常
//         if (gmoAuthorization === undefined) {
//             throw new Error('gmo authorization not found');
//         }
//         debug('gmoAuthorization:', gmoAuthorization);
//         // オーソリのオーダーIDと同一かどうか
//         if (gmoAuthorization.object.orderId !== notification.order_id) {
//             throw new Error('orderId not matched');
//         }
//         if (gmoAuthorization.object.accessId !== notification.access_id) {
//             throw new Error('accessId not matched');
//         }
//         if (gmoAuthorization.object.payType !== notification.pay_type) {
//             throw new Error('payType not matched');
//         }
//         // オーソリの金額と同一かどうか
//         // tslint:disable-next-line:no-magic-numbers
//         if (gmoAuthorization.price !== parseInt(notification.amount, 10)) {
//             throw new Error('amount not matched');
//         }
//         // health!
//     };
// }
