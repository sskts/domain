"use strict";
const queue_1 = require("../model/queue");
const cancelAuthorization_1 = require("../model/queue/cancelAuthorization");
const disableTransactionInquiry_1 = require("../model/queue/disableTransactionInquiry");
const pushNotification_1 = require("../model/queue/pushNotification");
const settleAuthorization_1 = require("../model/queue/settleAuthorization");
/**
 * キューファクトリー
 *
 * @namespace
 */
var QueueFactory;
(function (QueueFactory) {
    function create(args) {
        return new queue_1.default(args._id, args.group, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results);
    }
    QueueFactory.create = create;
    function createSettleAuthorization(args) {
        return new settleAuthorization_1.default(args._id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.authorization);
    }
    QueueFactory.createSettleAuthorization = createSettleAuthorization;
    function createCancelAuthorization(args) {
        return new cancelAuthorization_1.default(args._id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.authorization);
    }
    QueueFactory.createCancelAuthorization = createCancelAuthorization;
    function createPushNotification(args) {
        return new pushNotification_1.default(args._id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.notification);
    }
    QueueFactory.createPushNotification = createPushNotification;
    function createDisableTransactionInquiry(args) {
        return new disableTransactionInquiry_1.default(args._id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.transaction_id);
    }
    QueueFactory.createDisableTransactionInquiry = createDisableTransactionInquiry;
})(QueueFactory || (QueueFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueueFactory;
