"use strict";
/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
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
const order_1 = require("../repo/order");
const ownershipInfo_1 = require("../repo/ownershipInfo");
const transaction_1 = require("../repo/transaction");
const NotificationService = require("../service/notification");
const OrderService = require("../service/order");
const SalesService = require("../service/sales");
const StockService = require("../service/stock");
function sendEmailNotification(data) {
    return (__) => __awaiter(this, void 0, void 0, function* () {
        yield NotificationService.sendEmail(data.notification)();
    });
}
exports.sendEmailNotification = sendEmailNotification;
function cancelSeatReservation(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.default(connection);
        yield StockService.unauthorizeSeatReservation(data.transactionId)(transactionRepository);
    });
}
exports.cancelSeatReservation = cancelSeatReservation;
function cancelGMO(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.default(connection);
        yield SalesService.cancelGMOAuth(data.transactionId)(transactionRepository);
    });
}
exports.cancelGMO = cancelGMO;
function cancelMvtk(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.default(connection);
        yield SalesService.cancelMvtk(data.transactionId)(transactionRepository);
    });
}
exports.cancelMvtk = cancelMvtk;
function settleSeatReservation(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const ownershipInfoRepository = new ownershipInfo_1.default(connection);
        const transactionRepository = new transaction_1.default(connection);
        yield StockService.transferSeatReservation(data.transactionId)(ownershipInfoRepository, transactionRepository);
    });
}
exports.settleSeatReservation = settleSeatReservation;
function settleGMO(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.default(connection);
        yield SalesService.settleGMOAuth(data.transactionId)(transactionRepository);
    });
}
exports.settleGMO = settleGMO;
function settleMvtk(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.default(connection);
        yield SalesService.settleMvtk(data.transactionId)(transactionRepository);
    });
}
exports.settleMvtk = settleMvtk;
function createOrder(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const orderRepository = new order_1.default(connection);
        const transactionRepository = new transaction_1.default(connection);
        yield OrderService.createFromTransaction(data.transactionId)(orderRepository, transactionRepository);
    });
}
exports.createOrder = createOrder;
