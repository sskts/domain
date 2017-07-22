"use strict";
/**
 * `アクションファクトリー
 *
 * @namespace factory/action
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../error/argument");
const argumentNull_1 = require("../error/argumentNull");
const actionTasksExportationStatus_1 = require("./actionTasksExportationStatus");
const objectId_1 = require("./objectId");
/**
 * 取引を作成する
 *
 * @export
 * @returns {ITransaction} 取引
 * @memberof factory/transaction
 */
function create(args) {
    if (_.isEmpty(args.actionStatus))
        throw new argumentNull_1.default('actionStatus');
    if (!_.isDate(args.expires))
        throw new argument_1.default('expires', 'expires should be Date');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        typeOf: args.typeOf,
        actionStatus: args.actionStatus,
        agent: args.agent,
        result: args.result,
        error: args.error,
        object: args.object,
        expires: args.expires,
        startDate: args.startDate,
        endDate: args.endDate,
        tasksExportedAt: args.tasksExportedAt,
        // tslint:disable-next-line:max-line-length
        tasksExportationStatus: (args.tasksExportationStatus === undefined) ? actionTasksExportationStatus_1.default.Unexported : args.tasksExportationStatus,
        tasks: (args.tasks === undefined) ? [] : args.tasks
    };
}
exports.create = create;
