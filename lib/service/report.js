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
const queueStatus_1 = require("../factory/queueStatus");
const transactionQueuesStatus_1 = require("../factory/transactionQueuesStatus");
const transactionStatus_1 = require("../factory/transactionStatus");
const debug = createDebug('sskts-domain:service:report');
const TELEMETRY_UNIT_TIME_IN_SECONDS = 60; // 測定単位時間(秒)
/**
 * 測定データを作成する
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
function createTelemetry() {
    return (queueAdapter, telemetryAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const dateNow = moment();
        const dateNowByUnitTime = moment.unix((dateNow.unix() - (dateNow.unix() % TELEMETRY_UNIT_TIME_IN_SECONDS)));
        debug('counting ready transactions...');
        const numberOfTransactionsReady = yield transactionAdapter.transactionModel.count({
            status: transactionStatus_1.default.READY,
            expires_at: { $gt: dateNowByUnitTime.toDate() }
        }).exec();
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
        yield telemetryAdapter.telemetryModel.create({
            transactions: {
                numberOfReady: numberOfTransactionsReady,
                numberOfUnderway: numberOfTransactionsUnderway,
                numberOfClosedWithQueuesUnexported: numberOfTransactionsClosedWithQueuesUnexported,
                numberOfExpiredWithQueuesUnexported: numberOfTransactionsExpiredWithQueuesUnexported
            },
            queues: {
                numberOfUnexecuted: numberOfQueuesUnexecuted
            },
            executed_at: dateNowByUnitTime.toDate()
        });
    });
}
exports.createTelemetry = createTelemetry;
/**
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
function transactionStatuses() {
    return (queueAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        debug('counting ready transactions...');
        const numberOfTransactionsReady = yield transactionAdapter.transactionModel.count({
            status: transactionStatus_1.default.READY,
            expires_at: { $gt: new Date() }
        }).exec();
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
            numberOfTransactionsReady: numberOfTransactionsReady,
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
 * @memberof service/report
 */
function searchGMOSales(dateFrom, dateTo) {
    return (gmoNotificationAdapter) => __awaiter(this, void 0, void 0, function* () {
        // "tran_date": "20170415230109"の形式
        const notificationDocs = yield gmoNotificationAdapter.gmoNotificationModel.find({
            job_cd: GMO.Util.JOB_CD_SALES,
            tran_date: {
                $gte: moment(dateFrom).format('YYYYMMDDHHmmss'),
                $lte: moment(dateTo).format('YYYYMMDDHHmmss')
            }
        }).exec();
        return notificationDocs.map((notificationDoc) => {
            return {
                shop_id: notificationDoc.get('shop_id'),
                order_id: notificationDoc.get('order_id'),
                // tslint:disable-next-line:no-magic-numbers
                amount: parseInt(notificationDoc.get('amount'), 10),
                tran_date: notificationDoc.get('tran_date')
            };
        });
    });
}
exports.searchGMOSales = searchGMOSales;
