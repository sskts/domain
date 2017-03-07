/**
 * 取引イベントファクトリー
 *
 * @namespace TransactionEventFacroty
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objectId_1 = require("./objectId");
const transactionEventGroup_1 = require("./transactionEventGroup");
function createAuthorize(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: transactionEventGroup_1.default.AUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
exports.createAuthorize = createAuthorize;
function createUnauthorize(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: transactionEventGroup_1.default.UNAUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
exports.createUnauthorize = createUnauthorize;
function createNotificationAdd(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: transactionEventGroup_1.default.NOTIFICATION_ADD,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        notification: args.notification
    };
}
exports.createNotificationAdd = createNotificationAdd;
function createNotificationRemove(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: transactionEventGroup_1.default.NOTIFICATION_REMOVE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        notification: args.notification
    };
}
exports.createNotificationRemove = createNotificationRemove;
