"use strict";
/**
 * 注文取引ファクトリー
 *
 * @namespace factory/transaction/placeOrder
 */
Object.defineProperty(exports, "__esModule", { value: true });
const TranstransactionFactory = require("../transaction");
const transactionType_1 = require("../transactionType");
function create(args) {
    return Object.assign({}, TranstransactionFactory.create({
        typeOf: transactionType_1.default.PlaceOrder,
        status: args.status,
        agent: args.agent,
        result: args.result,
        error: args.error,
        object: args.object,
        expires: args.expires,
        startDate: args.startDate,
        endDate: args.endDate,
        tasksExportedAt: args.tasksExportedAt,
        tasksExportationStatus: args.tasksExportationStatus,
        tasks: args.tasks
    }), {
        seller: args.seller,
        object: args.object
    });
}
exports.create = create;
