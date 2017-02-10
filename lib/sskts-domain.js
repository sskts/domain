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
const asset_1 = require("./factory/asset");
exports.AssetFactory = asset_1.default;
const authorization_1 = require("./factory/authorization");
exports.AuthorizationFactory = authorization_1.default;
const film_1 = require("./factory/film");
exports.FilmFactory = film_1.default;
const notification_2 = require("./factory/notification");
exports.NotificationFactory = notification_2.default;
const objectId_1 = require("./factory/objectId");
exports.ObjectIdFactory = objectId_1.default;
const ownership_1 = require("./factory/ownership");
exports.OwnershipFactory = ownership_1.default;
const performance_1 = require("./factory/performance");
exports.PerformanceFactory = performance_1.default;
const queue_2 = require("./factory/queue");
exports.QueueFactory = queue_2.default;
const screen_1 = require("./factory/screen");
exports.ScreenFactory = screen_1.default;
const theater_2 = require("./factory/theater");
exports.TheaterFactory = theater_2.default;
const transaction_3 = require("./factory/transaction");
exports.TransactionFactory = transaction_3.default;
const transactionEvent_1 = require("./factory/transactionEvent");
exports.TransactionEventFactory = transactionEvent_1.default;
const transactionInquiryKey_1 = require("./factory/transactionInquiryKey");
exports.TransactionInquiryKeyFactory = transactionInquiryKey_1.default;
/**
 *
 *
 * @export
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
 * @export
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
