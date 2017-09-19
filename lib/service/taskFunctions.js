"use strict";
/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 * @namespace service.taskFunctions
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
const OwnershipInfoService = require("../service/ownershipInfo");
const SalesService = require("../service/sales");
const StockService = require("../service/stock");
function sendEmailNotification(data) {
    return (__) => __awaiter(this, void 0, void 0, function* () {
        yield NotificationService.sendEmail(data.emailMessage)();
    });
}
exports.sendEmailNotification = sendEmailNotification;
function cancelSeatReservation(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield StockService.unauthorizeSeatReservation(data.transactionId)(transactionRepository);
    });
}
exports.cancelSeatReservation = cancelSeatReservation;
function cancelCreditCard(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield SalesService.cancelCreditCardAuth(data.transactionId)(transactionRepository);
    });
}
exports.cancelCreditCard = cancelCreditCard;
function cancelMvtk(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield SalesService.cancelMvtk(data.transactionId)(transactionRepository);
    });
}
exports.cancelMvtk = cancelMvtk;
function settleSeatReservation(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield StockService.transferSeatReservation(data.transactionId)(transactionRepository);
    });
}
exports.settleSeatReservation = settleSeatReservation;
function settleCreditCard(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield SalesService.settleCreditCardAuth(data.transactionId)(transactionRepository);
    });
}
exports.settleCreditCard = settleCreditCard;
function settleMvtk(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield SalesService.settleMvtk(data.transactionId)(transactionRepository);
    });
}
exports.settleMvtk = settleMvtk;
function createOrder(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const orderRepository = new order_1.MongoRepository(connection);
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield OrderService.createFromTransaction(data.transactionId)(orderRepository, transactionRepository);
    });
}
exports.createOrder = createOrder;
function createOwnershipInfos(data) {
    return (connection) => __awaiter(this, void 0, void 0, function* () {
        const ownershipInfoRepository = new ownershipInfo_1.MongoRepository(connection);
        const transactionRepository = new transaction_1.MongoRepository(connection);
        yield OwnershipInfoService.createFromTransaction(data.transactionId)(ownershipInfoRepository, transactionRepository);
    });
}
exports.createOwnershipInfos = createOwnershipInfos;
