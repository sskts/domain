"use strict";
/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/taskFunctions
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
const createDebug = require("debug");
const transaction_1 = require("../adapter/transaction");
const NotificationService = require("../service/notification");
const SalesService = require("../service/sales");
const StockService = require("../service/stock");
const debug = createDebug('sskts-domain:service:taskFunctions');
function sendEmailNotification(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        yield NotificationService.sendEmail(data.notification)();
    });
}
exports.sendEmailNotification = sendEmailNotification;
function cancelSeatReservationAuthorization(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        // 座席予約承認を取り出す
        const transactionAdapter = new transaction_1.default(connection);
        const authorizations = yield transactionAdapter.findAuthorizationsById(data.transaction);
        const seatReservationAuthorization = authorizations.find((authorization) => authorization.id === data.authorization);
        yield StockService.unauthorizeCOASeatReservation(seatReservationAuthorization)();
    });
}
exports.cancelSeatReservationAuthorization = cancelSeatReservationAuthorization;
function cancelGMOAuthorization(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        // 座席予約承認を取り出す
        const transactionAdapter = new transaction_1.default(connection);
        const authorizations = yield transactionAdapter.findAuthorizationsById(data.transaction);
        const gmoAuthorization = authorizations.find((authorization) => authorization.id === data.authorization);
        yield SalesService.cancelGMOAuth(gmoAuthorization)();
    });
}
exports.cancelGMOAuthorization = cancelGMOAuthorization;
function cancelMvtkAuthorization(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        // await salesService.cancelMvtkAuthorization(queueDoc.get('authorization'))();
    });
}
exports.cancelMvtkAuthorization = cancelMvtkAuthorization;
function disableTransactionInquiry(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        // await stockService.disableTransactionInquiry(queueDoc.get('transaction'))(transactionAdapter);
    });
}
exports.disableTransactionInquiry = disableTransactionInquiry;
function settleSeatReservationAuthorization(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        // await stockService.transferCOASeatReservation(queueDoc.get('authorization'))(
        //     assetAdapter, ownerAdapter, performanceAdapter
        // );
    });
}
exports.settleSeatReservationAuthorization = settleSeatReservationAuthorization;
function settleGMOAuthorization(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        // await salesService.settleGMOAuth(queueDoc.get('authorization'))();
    });
}
exports.settleGMOAuthorization = settleGMOAuthorization;
function settleMvtkAuthorization(data) {
    debug('executing...', data);
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        debug('creating adapters on connection...', connection);
        // await salesService.settleMvtkAuthorization(queueDoc.get('authorization'))();
    });
}
exports.settleMvtkAuthorization = settleMvtkAuthorization;
