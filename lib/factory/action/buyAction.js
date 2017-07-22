"use strict";
/**
 * `購入アクションファクトリー
 *
 * @namespace factory/action/buyAction
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ActionFactory = require("../action");
function create(args) {
    return Object.assign({}, ActionFactory.create({
        typeOf: 'BuyAction',
        actionStatus: args.actionStatus,
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
