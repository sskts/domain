"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objectId_1 = require("./objectId");
const queueGroup_1 = require("./queueGroup");
function create(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: args.group,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results
    };
}
exports.create = create;
function createSettleAuthorization(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: queueGroup_1.default.SETTLE_AUTHORIZATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        authorization: args.authorization
    };
}
exports.createSettleAuthorization = createSettleAuthorization;
function createCancelAuthorization(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: queueGroup_1.default.CANCEL_AUTHORIZATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        authorization: args.authorization
    };
}
exports.createCancelAuthorization = createCancelAuthorization;
function createPushNotification(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: queueGroup_1.default.PUSH_NOTIFICATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        notification: args.notification
    };
}
exports.createPushNotification = createPushNotification;
function createDisableTransactionInquiry(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: queueGroup_1.default.DISABLE_TRANSACTION_INQUIRY,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        transaction: args.transaction
    };
}
exports.createDisableTransactionInquiry = createDisableTransactionInquiry;
