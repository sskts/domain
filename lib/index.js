"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const masterService = require("./service/master");
const notificationService = require("./service/notification");
const salesService = require("./service/sales");
const stockService = require("./service/stock");
const transactionService = require("./service/transaction");
const asset_1 = require("./adapter/asset");
const film_1 = require("./adapter/film");
const owner_1 = require("./adapter/owner");
const performance_1 = require("./adapter/performance");
const queue_1 = require("./adapter/queue");
const screen_1 = require("./adapter/screen");
const theater_1 = require("./adapter/theater");
const transaction_1 = require("./adapter/transaction");
const asset = require("./factory/asset");
const authorization = require("./factory/authorization");
const notification = require("./factory/notification");
const owner = require("./factory/owner");
const ownership = require("./factory/ownership");
const queueStatus_1 = require("./factory/queueStatus");
const transactionInquiryKey = require("./factory/transactionInquiryKey");
const transactionQueuesStatus_1 = require("./factory/transactionQueuesStatus");
const transactionStatus_1 = require("./factory/transactionStatus");
function createAssetAdapter(connection) {
    return new asset_1.default(connection);
}
exports.createAssetAdapter = createAssetAdapter;
function createFilmAdapter(connection) {
    return new film_1.default(connection);
}
exports.createFilmAdapter = createFilmAdapter;
function createOwnerAdapter(connection) {
    return new owner_1.default(connection);
}
exports.createOwnerAdapter = createOwnerAdapter;
function createPerformanceAdapter(connection) {
    return new performance_1.default(connection);
}
exports.createPerformanceAdapter = createPerformanceAdapter;
function createQueueAdapter(connection) {
    return new queue_1.default(connection);
}
exports.createQueueAdapter = createQueueAdapter;
function createScreenAdapter(connection) {
    return new screen_1.default(connection);
}
exports.createScreenAdapter = createScreenAdapter;
function createTransactionAdapter(connection) {
    return new transaction_1.default(connection);
}
exports.createTransactionAdapter = createTransactionAdapter;
function createTheaterAdapter(connection) {
    return new theater_1.default(connection);
}
exports.createTheaterAdapter = createTheaterAdapter;
exports.service = {
    master: masterService,
    notification: notificationService,
    sales: salesService,
    stock: stockService,
    transaction: transactionService
};
exports.factory = {
    asset,
    authorization,
    notification,
    owner,
    ownership,
    queueStatus: queueStatus_1.default,
    transactionInquiryKey,
    transactionQueuesStatus: transactionQueuesStatus_1.default,
    transactionStatus: transactionStatus_1.default
};
