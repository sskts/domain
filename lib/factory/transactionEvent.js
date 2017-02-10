"use strict";
const transactionEvent_1 = require("../model/transactionEvent");
const authorize_1 = require("../model/transactionEvent/authorize");
const notificationAdd_1 = require("../model/transactionEvent/notificationAdd");
const notificationRemove_1 = require("../model/transactionEvent/notificationRemove");
const unauthorize_1 = require("../model/transactionEvent/unauthorize");
/**
 * 取引イベントファクトリー
 *
 * @namespace
 */
var TransactionEventFactory;
(function (TransactionEventFactory) {
    function create(args) {
        return new transactionEvent_1.default(args._id, args.group, args.occurred_at);
    }
    TransactionEventFactory.create = create;
    function createAuthorize(args) {
        return new authorize_1.default(args._id, args.occurred_at, args.authorization);
    }
    TransactionEventFactory.createAuthorize = createAuthorize;
    function createUnauthorize(args) {
        return new unauthorize_1.default(args._id, args.occurred_at, args.authorization);
    }
    TransactionEventFactory.createUnauthorize = createUnauthorize;
    function createNotificationAdd(args) {
        return new notificationAdd_1.default(args._id, args.occurred_at, args.notification);
    }
    TransactionEventFactory.createNotificationAdd = createNotificationAdd;
    function createNotificationRemove(args) {
        return new notificationRemove_1.default(args._id, args.occurred_at, args.notification);
    }
    TransactionEventFactory.createNotificationRemove = createNotificationRemove;
})(TransactionEventFactory || (TransactionEventFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEventFactory;
