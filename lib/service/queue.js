"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * キューサービス
 *
 * @namespace StockService
 */
const createDebug = require("debug");
const moment = require("moment");
const util = require("util");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const notificationGroup_1 = require("../factory/notificationGroup");
const queueGroup_1 = require("../factory/queueGroup");
const queueStatus_1 = require("../factory/queueStatus");
const notificationService = require("./notification");
const salesService = require("./sales");
const stockService = require("./stock");
const debug = createDebug('sskts-domain:service:queue');
/**
 * メール送信キュー実行
 *
 * @export
 */
function executeSendEmailNotification() {
    return (queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のメール送信キューを取得
        let queueDoc = yield queueAdapter.model.findOneAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
            run_at: { $lt: new Date() },
            group: queueGroup_1.default.PUSH_NOTIFICATION,
            'notification.group': notificationGroup_1.default.EMAIL
        }, {
            status: queueStatus_1.default.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }, { new: true }).exec();
        debug('queueDoc is', queueDoc);
        if (queueDoc === null) {
            // return null;
        }
        else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield notificationService.sendEmail(queueDoc.get('notification'))();
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { status: queueStatus_1.default.EXECUTED }, { new: true }).exec();
            }
            catch (error) {
                // 実行結果追加
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { $push: { results: error.stack } }, { new: true }).exec();
            }
            // return <QueueStatus>queueDoc.get('status');
        }
    });
}
exports.executeSendEmailNotification = executeSendEmailNotification;
/**
 * COA仮予約キャンセルキュー実行
 *
 * @export
 */
function executeCancelCOASeatReservationAuthorization() {
    return (queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のCOA仮予約取消キューを取得
        let queueDoc = yield queueAdapter.model.findOneAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
            run_at: { $lt: new Date() },
            group: queueGroup_1.default.CANCEL_AUTHORIZATION,
            'authorization.group': authorizationGroup_1.default.COA_SEAT_RESERVATION
        }, {
            status: queueStatus_1.default.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }, { new: true }).exec();
        debug('queueDoc is', queueDoc);
        if (queueDoc === null) {
            // return null;
        }
        else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield stockService.unauthorizeCOASeatReservation(queueDoc.get('authorization'))();
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { status: queueStatus_1.default.EXECUTED }, { new: true }).exec();
            }
            catch (error) {
                // 実行結果追加
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { $push: { results: error.stack } }, { new: true }).exec();
            }
            // return <QueueStatus>queueDoc.get('status');
        }
    });
}
exports.executeCancelCOASeatReservationAuthorization = executeCancelCOASeatReservationAuthorization;
/**
 * GMO仮売上取消キュー実行
 *
 * @export
 */
function executeCancelGMOAuthorization() {
    return (queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のGMOオーソリ取消キューを取得
        let queueDoc = yield queueAdapter.model.findOneAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
            run_at: { $lt: new Date() },
            group: queueGroup_1.default.CANCEL_AUTHORIZATION,
            'authorization.group': authorizationGroup_1.default.GMO
        }, {
            status: queueStatus_1.default.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }, { new: true }).exec();
        debug('queueDoc is', queueDoc);
        if (queueDoc === null) {
            // return null;
        }
        else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield salesService.cancelGMOAuth(queueDoc.get('authorization'))();
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { status: queueStatus_1.default.EXECUTED }, { new: true }).exec();
            }
            catch (error) {
                // 実行結果追加
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { $push: { results: error.stack } }, { new: true }).exec();
            }
            // return <QueueStatus>queueDoc.get('status');
        }
    });
}
exports.executeCancelGMOAuthorization = executeCancelGMOAuthorization;
/**
 * 取引照会無効化キュー実行
 *
 * @export
 */
function executeDisableTransactionInquiry() {
    return (queueAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        let queueDoc = yield queueAdapter.model.findOneAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
            run_at: { $lt: new Date() },
            group: queueGroup_1.default.DISABLE_TRANSACTION_INQUIRY
        }, {
            status: queueStatus_1.default.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }, { new: true }).exec();
        debug('queueDoc is', queueDoc);
        if (queueDoc === null) {
            // return null;
        }
        else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield stockService.disableTransactionInquiry(queueDoc.get('transaction'))(transactionAdapter);
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { status: queueStatus_1.default.EXECUTED }, { new: true }).exec();
            }
            catch (error) {
                // 実行結果追加
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { $push: { results: error.stack } }, { new: true }).exec();
            }
            // return <QueueStatus>queueDoc.get('status');
        }
    });
}
exports.executeDisableTransactionInquiry = executeDisableTransactionInquiry;
/**
 * COA本予約キュー実行
 *
 * @export
 */
function executeSettleCOASeatReservationAuthorization() {
    return (assetAdapter, queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のCOA資産移動キューを取得
        let queueDoc = yield queueAdapter.model.findOneAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
            run_at: { $lt: new Date() },
            group: queueGroup_1.default.SETTLE_AUTHORIZATION,
            'authorization.group': authorizationGroup_1.default.COA_SEAT_RESERVATION
        }, {
            status: queueStatus_1.default.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }, { new: true }).exec();
        debug('queueDoc is', queueDoc);
        if (queueDoc === null) {
            // return null;
        }
        else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield stockService.transferCOASeatReservation(queueDoc.get('authorization'))(assetAdapter);
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { status: queueStatus_1.default.EXECUTED }, { new: true }).exec();
            }
            catch (error) {
                // 実行結果追加
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { $push: { results: error.stack } }, { new: true }).exec();
            }
            // return <QueueStatus>queueDoc.get('status');
        }
    });
}
exports.executeSettleCOASeatReservationAuthorization = executeSettleCOASeatReservationAuthorization;
/**
 * GMO実売上キュー実行
 *
 * @export
 */
function executeSettleGMOAuthorization() {
    return (queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のGMO実売上キューを取得
        let queueDoc = yield queueAdapter.model.findOneAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
            run_at: { $lt: new Date() },
            group: queueGroup_1.default.SETTLE_AUTHORIZATION,
            'authorization.group': authorizationGroup_1.default.GMO
        }, {
            status: queueStatus_1.default.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }, { new: true }).exec();
        debug('queueDoc is', queueDoc);
        if (queueDoc === null) {
            // return null;
        }
        else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield salesService.settleGMOAuth(queueDoc.get('authorization'))();
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { status: queueStatus_1.default.EXECUTED }, { new: true }).exec();
            }
            catch (error) {
                // 実行結果追加
                queueDoc = yield queueAdapter.model.findByIdAndUpdate(queueDoc.get('id'), { $push: { results: error.stack } }, { new: true }).exec();
            }
            // return <QueueStatus>queueDoc.get('status');
        }
    });
}
exports.executeSettleGMOAuthorization = executeSettleGMOAuthorization;
/**
 * リトライ
 *
 * @export
 * @param {number} intervalInMinutes
 */
function retry(intervalInMinutes) {
    return (queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield queueAdapter.model.update({
            status: queueStatus_1.default.RUNNING,
            last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
            // tslint:disable-next-line:no-invalid-this space-before-function-paren
            $where: function () { return (this.max_count_try > this.count_tried); }
        }, {
            status: queueStatus_1.default.UNEXECUTED // 実行中に変更
        }, { multi: true }).exec();
    });
}
exports.retry = retry;
/**
 * 実行中止
 *
 * @export
 * @param {number} intervalInMinutes
 */
function abort(intervalInMinutes) {
    return (queueAdapter) => __awaiter(this, void 0, void 0, function* () {
        const abortedQueueDoc = yield queueAdapter.model.findOneAndUpdate({
            status: queueStatus_1.default.RUNNING,
            last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
            // tslint:disable-next-line:no-invalid-this space-before-function-paren
            $where: function () { return (this.max_count_try === this.count_tried); }
        }, {
            status: queueStatus_1.default.ABORTED
        }, { new: true }).exec();
        debug('abortedQueueDoc:', abortedQueueDoc);
        if (abortedQueueDoc === null) {
            // return null;
        }
        else {
            // メール通知
            yield notificationService.report2developers('キューの実行が中止されました', `
aborted queue:\n
${util.inspect(abortedQueueDoc.toObject(), { showHidden: true, depth: 10 })}\n
`)();
            // return <string>abortedQueueDoc.get('id');
        }
    });
}
exports.abort = abort;
