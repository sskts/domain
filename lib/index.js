"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const masterService = require("./service/master");
const notificationService = require("./service/notification");
const salesService = require("./service/sales");
const stockService = require("./service/stock");
const transactionService = require("./service/transaction");
const asset_1 = require("./repository/interpreter/asset");
const film_1 = require("./repository/interpreter/film");
const owner_1 = require("./repository/interpreter/owner");
const performance_1 = require("./repository/interpreter/performance");
const queue_1 = require("./repository/interpreter/queue");
const screen_1 = require("./repository/interpreter/screen");
const theater_1 = require("./repository/interpreter/theater");
const transaction_1 = require("./repository/interpreter/transaction");
const Asset = require("./model/asset");
const Authorization = require("./model/authorization");
const Notification = require("./model/notification");
const Ownership = require("./model/ownership");
const queueStatus_1 = require("./model/queueStatus");
const TransactionInquiryKey = require("./model/transactionInquiryKey");
const transactionQueuesStatus_1 = require("./model/transactionQueuesStatus");
const transactionStatus_1 = require("./model/transactionStatus");
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
exports.service = {
    master: masterService,
    notification: notificationService,
    sales: salesService,
    stock: stockService,
    transaction: transactionService
};
exports.model = {
    Asset,
    Authorization,
    Notification,
    Ownership,
    QueueStatus: queueStatus_1.default,
    TransactionInquiryKey,
    TransactionQueuesStatus: transactionQueuesStatus_1.default,
    TransactionStatus: transactionStatus_1.default
};
