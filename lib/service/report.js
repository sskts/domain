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
const GMOAuthorization = require("../factory/authorization/gmo");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const queueStatus_1 = require("../factory/queueStatus");
const transactionQueuesStatus_1 = require("../factory/transactionQueuesStatus");
const transactionStatus_1 = require("../factory/transactionStatus");
const argument_1 = require("../error/argument");
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
            expires_at: { $gt: moment().toDate() }
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
            expires_at: { $gt: moment().toDate() }
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
        // オーダーIDからCOA予約番号を取得
        // tslint:disable-next-line:no-magic-numbers
        const reserveNum = parseInt(notification.order_id.slice(11, 19), 10);
        debug('reserveNum:', reserveNum);
        if (!Number.isInteger(reserveNum)) {
            throw new Error('invalid orderId');
        }
        const transactionDoc = yield transactionAdapter.transactionModel.findOne({
            status: transactionStatus_1.default.CLOSED,
            'inquiry_key.reserve_num': reserveNum
        }, '_id').exec();
        debug('transactionDoc:', transactionDoc);
        if (transactionDoc === null) {
            throw new Error('transaction not found');
        }
        const authorizations = yield transactionAdapter.findAuthorizationsById(transactionDoc.get('id'));
        const gmoAuthorizationObject = authorizations.find((authorization) => authorization.group === authorizationGroup_1.default.GMO);
        // GMOオーソリがなければ異常
        if (gmoAuthorizationObject === undefined) {
            throw new Error('gmo authorization not found');
        }
        const gmoAuthorization = GMOAuthorization.create(gmoAuthorizationObject);
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
    });
}
exports.examineGMOSales = examineGMOSales;
