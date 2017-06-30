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
const _ = require("underscore");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const queueStatus_1 = require("../factory/queueStatus");
const transactionQueuesStatus_1 = require("../factory/transactionQueuesStatus");
const transactionStatus_1 = require("../factory/transactionStatus");
const argument_1 = require("../error/argument");
const debug = createDebug('sskts-domain:service:report');
const TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS = 60; // 測定単位時間(秒)
/**
 * 測定データを作成する
 *
 * @returns {QueueAndTelemetryAndTransactionOperation<void>}
 * @memberof service/report
 */
function createTelemetry() {
    return (queueAdapter, telemetryAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const dateNow = moment();
        const measuredTo = moment.unix((dateNow.unix() - (dateNow.unix() % TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS)));
        const measuredFrom = moment(measuredTo).add(-TELEMETRY_UNIT_OF_MEASUREMENT_IN_SECONDS, 'seconds');
        const measuredAt = moment(measuredTo);
        const flowData = yield createFlowTelemetry(measuredFrom.toDate(), measuredTo.toDate())(queueAdapter, transactionAdapter);
        const stockData = yield createStockTelemetry(measuredAt.toDate())(queueAdapter, transactionAdapter);
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
 * @returns {QueueAndTransactionOperation<IFlow>}
 */
function createFlowTelemetry(measuredFrom, measuredTo) {
    // tslint:disable-next-line:max-func-body-length
    return (queueAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
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
        const amounts = yield Promise.all(closedTransactions.map((transaction) => __awaiter(this, void 0, void 0, function* () { return yield transactionAdapter.calculateAmountById(transaction.get('id')); })));
        const totalAmount = amounts.reduce((a, b) => a + b, 0);
        const maxAmount = amounts.reduce((a, b) => Math.max(a, b), 0);
        const minAmount = amounts.reduce((a, b) => Math.min(a, b), (numberOfTransactionsClosed > 0) ? amounts[0] : 0);
        const numberOfTransactionsExpired = yield transactionAdapter.transactionModel.count({
            expired_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            }
        }).exec();
        const numberOfQueuesCreated = yield queueAdapter.model.count({
            created_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            }
        }).exec();
        // 実行中止ステータスで、最終試行日時が範囲にあるものを実行キュー数とする
        const numberOfQueuesAborted = yield queueAdapter.model.count({
            last_tried_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            },
            status: queueStatus_1.default.ABORTED
        }).exec();
        // 実行済みステータスで、最終試行日時が範囲にあるものを実行キュー数とする
        const executedQueues = yield queueAdapter.model.find({
            last_tried_at: {
                $gte: measuredFrom,
                $lt: measuredTo
            },
            status: queueStatus_1.default.EXECUTED
        }, 'run_at last_tried_at count_tried').exec();
        const numberOfQueuesExecuted = executedQueues.length;
        const latencies = yield Promise.all(executedQueues.map((queue) => moment(queue.get('last_tried_at')).diff(moment(queue.get('run_at'), 'milliseconds'))));
        const totalLatency = latencies.reduce((a, b) => a + b, 0);
        const maxLatency = latencies.reduce((a, b) => Math.max(a, b), 0);
        const minLatency = latencies.reduce((a, b) => Math.min(a, b), (numberOfQueuesExecuted > 0) ? latencies[0] : 0);
        const numbersOfTrials = yield Promise.all(executedQueues.map((queue) => queue.get('count_tried')));
        const totalNumberOfTrials = numbersOfTrials.reduce((a, b) => a + b, 0);
        const maxNumberOfTrials = numbersOfTrials.reduce((a, b) => Math.max(a, b), 0);
        const minNumberOfTrials = numbersOfTrials.reduce((a, b) => Math.min(a, b), (numberOfQueuesExecuted > 0) ? numbersOfTrials[0] : 0);
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
            queues: {
                numberOfCreated: numberOfQueuesCreated,
                numberOfExecuted: numberOfQueuesExecuted,
                numberOfAborted: numberOfQueuesAborted,
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
 * @returns {QueueAndTransactionOperation<IStock>}
 */
function createStockTelemetry(measuredAt) {
    // tslint:disable-next-line:max-func-body-length
    return (queueAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
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
                    status: transactionStatus_1.default.UNDERWAY
                }
            ]
        }).exec();
        const numberOfQueuesUnexecuted = yield queueAdapter.model.count({
            $or: [
                // {measuredAt}以前に作成され、{measuredAt}以後に実行試行されたキュー
                {
                    created_at: {
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
                // {measuredAt}以前に作成され、いまだに未実行のキュー
                {
                    created_at: {
                        $lte: measuredAt
                    },
                    status: queueStatus_1.default.UNEXECUTED
                }
            ]
        }).exec();
        return {
            transactions: {
                numberOfUnderway: numberOfTransactionsUnderway
            },
            queues: {
                numberOfUnexecuted: numberOfQueuesUnexecuted
            },
            measured_at: measuredAt
        };
    });
}
exports.createStockTelemetry = createStockTelemetry;
/**
 * 状態ごとの取引数を算出する
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
function transactionStatuses() {
    return (queueAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        debug('counting underway transactions...');
        const numberOfTransactionsUnderway = yield transactionAdapter.transactionModel.count({
            status: transactionStatus_1.default.UNDERWAY
        }).exec();
        const numberOfTransactionsClosedWithQueuesUnexported = yield transactionAdapter.transactionModel.count({
            status: transactionStatus_1.default.CLOSED,
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        }).exec();
        const numberOfTransactionsExpiredWithQueuesUnexported = yield transactionAdapter.transactionModel.count({
            status: transactionStatus_1.default.EXPIRED,
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        }).exec();
        const numberOfQueuesUnexecuted = yield queueAdapter.model.count({
            status: queueStatus_1.default.UNEXECUTED
        }).exec();
        return {
            numberOfTransactionsUnderway: numberOfTransactionsUnderway,
            numberOfTransactionsClosedWithQueuesUnexported: numberOfTransactionsClosedWithQueuesUnexported,
            numberOfTransactionsExpiredWithQueuesUnexported: numberOfTransactionsExpiredWithQueuesUnexported,
            numberOfQueuesUnexecuted: numberOfQueuesUnexecuted
        };
    });
}
exports.transactionStatuses = transactionStatuses;
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
 *
 * @param {ICreditGMONotification} notification GMOクレジットカード通知
 */
function examineGMOSales(notification) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        if (notification.job_cd !== GMO.Util.JOB_CD_SALES) {
            throw new argument_1.default('notification.job_cd', 'job_cd should be SALES');
        }
        if (!_.isEmpty(notification.err_code)) {
            throw new Error(`err_code exists${notification.err_code}`);
        }
        // オーダーIDから劇場コードと予約番号を取得
        // tslint:disable-next-line:no-magic-numbers
        const theaterCode = notification.order_id.slice(8, 11);
        // tslint:disable-next-line:no-magic-numbers
        const reserveNum = parseInt(notification.order_id.slice(11, 19), 10);
        debug('theaterCode, reserveNum:', theaterCode, reserveNum);
        if (typeof theaterCode !== 'string' || !Number.isInteger(reserveNum)) {
            throw new Error('invalid orderId');
        }
        const transactionDoc = yield transactionAdapter.transactionModel.findOne({
            status: transactionStatus_1.default.CLOSED,
            'inquiry_key.theater_code': theaterCode,
            'inquiry_key.reserve_num': reserveNum
        }, '_id').exec();
        debug('transactionDoc:', transactionDoc);
        if (transactionDoc === null) {
            throw new Error('transaction not found');
        }
        const authorizations = yield transactionAdapter.findAuthorizationsById(transactionDoc.get('id'));
        const gmoAuthorization = authorizations.find((authorization) => authorization.group === authorizationGroup_1.default.GMO);
        // GMOオーソリがなければ異常
        if (gmoAuthorization === undefined) {
            throw new Error('gmo authorization not found');
        }
        debug('gmoAuthorization:', gmoAuthorization);
        // オーソリのオーダーIDと同一かどうか
        if (gmoAuthorization.gmo_order_id !== notification.order_id) {
            throw new Error('order_id not matched');
        }
        if (gmoAuthorization.gmo_access_id !== notification.access_id) {
            throw new Error('gmo_access_id not matched');
        }
        if (gmoAuthorization.gmo_pay_type !== notification.pay_type) {
            throw new Error('gmo_pay_type not matched');
        }
        // オーソリの金額と同一かどうか
        // tslint:disable-next-line:no-magic-numbers
        if (gmoAuthorization.price !== parseInt(notification.amount, 10)) {
            throw new Error('amount not matched');
        }
        // health!
    });
}
exports.examineGMOSales = examineGMOSales;
