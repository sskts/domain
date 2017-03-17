"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const masterService = require("./service/master");
const notificationService = require("./service/notification");
const queueService = require("./service/queue");
const salesService = require("./service/sales");
const stockService = require("./service/stock");
const transactionService = require("./service/transaction");
const transactionWithIdService = require("./service/transactionWithId");
const asset_1 = require("./adapter/asset");
const film_1 = require("./adapter/film");
const owner_1 = require("./adapter/owner");
const performance_1 = require("./adapter/performance");
const queue_1 = require("./adapter/queue");
const screen_1 = require("./adapter/screen");
const theater_1 = require("./adapter/theater");
const transaction_1 = require("./adapter/transaction");
const asset = require("./factory/asset");
const assetGroup_1 = require("./factory/assetGroup");
const authorization = require("./factory/authorization");
const authorizationGroup_1 = require("./factory/authorizationGroup");
const film = require("./factory/film");
const notification = require("./factory/notification");
const notificationGroup = require("./factory/notificationGroup");
const owner = require("./factory/owner");
const ownerGroup = require("./factory/ownerGroup");
const ownership = require("./factory/ownership");
const performance = require("./factory/performance");
const queue = require("./factory/queue");
const queueGroup_1 = require("./factory/queueGroup");
const queueStatus_1 = require("./factory/queueStatus");
const screen = require("./factory/screen");
const theater = require("./factory/theater");
const transaction = require("./factory/transaction");
const transactionEvent = require("./factory/transactionEvent");
const transactionEventGroup_1 = require("./factory/transactionEventGroup");
const transactionInquiryKey = require("./factory/transactionInquiryKey");
const transactionQueuesStatus_1 = require("./factory/transactionQueuesStatus");
const transactionStatus_1 = require("./factory/transactionStatus");
exports.adapter = {
    asset: (connection) => {
        return new asset_1.default(connection);
    },
    film: (connection) => {
        return new film_1.default(connection);
    },
    owner: (connection) => {
        return new owner_1.default(connection);
    },
    performance: (connection) => {
        return new performance_1.default(connection);
    },
    queue: (connection) => {
        return new queue_1.default(connection);
    },
    screen: (connection) => {
        return new screen_1.default(connection);
    },
    theater: (connection) => {
        return new theater_1.default(connection);
    },
    transaction: (connection) => {
        return new transaction_1.default(connection);
    }
};
exports.service = {
    master: masterService,
    notification: notificationService,
    queue: queueService,
    sales: salesService,
    stock: stockService,
    transaction: transactionService,
    transactionWithId: transactionWithIdService
};
exports.factory = {
    asset,
    assetGroup: assetGroup_1.default,
    authorization,
    authorizationGroup: authorizationGroup_1.default,
    film,
    notification,
    notificationGroup,
    owner,
    ownerGroup,
    ownership,
    performance,
    queue,
    queueGroup: queueGroup_1.default,
    queueStatus: queueStatus_1.default,
    screen,
    theater,
    transaction,
    transactionEventGroup: transactionEventGroup_1.default,
    transactionEvent,
    transactionInquiryKey,
    transactionQueuesStatus: transactionQueuesStatus_1.default,
    transactionStatus: transactionStatus_1.default
};
