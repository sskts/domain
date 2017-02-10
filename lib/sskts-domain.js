"use strict";
const master_1 = require("./service/interpreter/master");
const notification_1 = require("./service/interpreter/notification");
const sales_1 = require("./service/interpreter/sales");
const stock_1 = require("./service/interpreter/stock");
const transaction_1 = require("./service/interpreter/transaction");
const owner_1 = require("./repository/interpreter/owner");
const queue_1 = require("./repository/interpreter/queue");
const theater_1 = require("./repository/interpreter/theater");
const transaction_2 = require("./repository/interpreter/transaction");
const AssetFactory = require("./factory/asset");
exports.AssetFactory = AssetFactory;
const AuthorizationFactory = require("./factory/authorization");
exports.AuthorizationFactory = AuthorizationFactory;
const FilmFactory = require("./factory/film");
exports.FilmFactory = FilmFactory;
const NotificationFactory = require("./factory/notification");
exports.NotificationFactory = NotificationFactory;
const ObjectIdFactory = require("./factory/objectId");
exports.ObjectIdFactory = ObjectIdFactory;
const OwnershipFactory = require("./factory/ownership");
exports.OwnershipFactory = OwnershipFactory;
const PerformanceFactory = require("./factory/performance");
exports.PerformanceFactory = PerformanceFactory;
const QueueFactory = require("./factory/queue");
exports.QueueFactory = QueueFactory;
const ScreenFactory = require("./factory/screen");
exports.ScreenFactory = ScreenFactory;
const TheaterFactory = require("./factory/theater");
exports.TheaterFactory = TheaterFactory;
const TransactionFactory = require("./factory/transaction");
exports.TransactionFactory = TransactionFactory;
const TransactionEventFactory = require("./factory/transactionEvent");
exports.TransactionEventFactory = TransactionEventFactory;
const TransactionInquiryKeyFactory = require("./factory/transactionInquiryKey");
exports.TransactionInquiryKeyFactory = TransactionInquiryKeyFactory;
/**
 *
 *
 *
 * @returns {MasterService}
 */
function createMasterService() {
    return new master_1.default();
}
exports.createMasterService = createMasterService;
function createTransactionService() {
    return new transaction_1.default();
}
exports.createTransactionService = createTransactionService;
function createStockService() {
    return new stock_1.default();
}
exports.createStockService = createStockService;
function createSalesService() {
    return new sales_1.default();
}
exports.createSalesService = createSalesService;
function createNotificationService() {
    return new notification_1.default();
}
exports.createNotificationService = createNotificationService;
/**
 *
 *
 *
 * @param {mongoose.Connection} connection
 * @returns {TheaterRepository}
 */
function createOwnerRepository(connection) {
    return new owner_1.default(connection);
}
exports.createOwnerRepository = createOwnerRepository;
function createQueueRepository(connection) {
    return new queue_1.default(connection);
}
exports.createQueueRepository = createQueueRepository;
function createTransactionRepository(connection) {
    return new transaction_2.default(connection);
}
exports.createTransactionRepository = createTransactionRepository;
function createTheaterRepository(connection) {
    return new theater_1.default(connection);
}
exports.createTheaterRepository = createTheaterRepository;
