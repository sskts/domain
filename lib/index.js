"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MasterService = require("./service/master");
exports.MasterService = MasterService;
const NotificationService = require("./service/notification");
exports.NotificationService = NotificationService;
const SalesService = require("./service/sales");
exports.SalesService = SalesService;
const StockService = require("./service/stock");
exports.StockService = StockService;
const TransactionService = require("./service/transaction");
exports.TransactionService = TransactionService;
const asset_1 = require("./repository/interpreter/asset");
const film_1 = require("./repository/interpreter/film");
const owner_1 = require("./repository/interpreter/owner");
const performance_1 = require("./repository/interpreter/performance");
const queue_1 = require("./repository/interpreter/queue");
const screen_1 = require("./repository/interpreter/screen");
const theater_1 = require("./repository/interpreter/theater");
const transaction_1 = require("./repository/interpreter/transaction");
const asset_2 = require("./model/asset");
exports.Asset = asset_2.default;
const authorization_1 = require("./model/authorization");
exports.Authorization = authorization_1.default;
const notification_1 = require("./model/notification");
exports.Notification = notification_1.default;
const ownership_1 = require("./model/ownership");
exports.Ownership = ownership_1.default;
const queueStatus_1 = require("./model/queueStatus");
exports.QueueStatus = queueStatus_1.default;
const transactionInquiryKey_1 = require("./model/transactionInquiryKey");
exports.TransactionInquiryKey = transactionInquiryKey_1.default;
const transactionQueuesStatus_1 = require("./model/transactionQueuesStatus");
exports.TransactionQueuesStatus = transactionQueuesStatus_1.default;
const transactionStatus_1 = require("./model/transactionStatus");
exports.TransactionStatus = transactionStatus_1.default;
function createAssetRepository(connection) {
    return new asset_1.default(connection);
}
exports.createAssetRepository = createAssetRepository;
function createFilmRepository(connection) {
    return new film_1.default(connection);
}
exports.createFilmRepository = createFilmRepository;
function createOwnerRepository(connection) {
    return new owner_1.default(connection);
}
exports.createOwnerRepository = createOwnerRepository;
function createPerformanceRepository(connection) {
    return new performance_1.default(connection);
}
exports.createPerformanceRepository = createPerformanceRepository;
function createQueueRepository(connection) {
    return new queue_1.default(connection);
}
exports.createQueueRepository = createQueueRepository;
function createScreenRepository(connection) {
    return new screen_1.default(connection);
}
exports.createScreenRepository = createScreenRepository;
function createTransactionRepository(connection) {
    return new transaction_1.default(connection);
}
exports.createTransactionRepository = createTransactionRepository;
function createTheaterRepository(connection) {
    return new theater_1.default(connection);
}
exports.createTheaterRepository = createTheaterRepository;
