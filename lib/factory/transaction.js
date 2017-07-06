"use strict";
/**
 * 取引ファクトリー
 *
 * @namespace factory/transaction
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../error/argument");
const argumentNull_1 = require("../error/argumentNull");
const ClientUserFactory = require("./clientUser");
const objectId_1 = require("./objectId");
const transactionTasksExportationStatus_1 = require("./transactionTasksExportationStatus");
/**
 * 取引を作成する
 *
 * @export
 * @returns {ITransaction} 取引
 * @memberof factory/transaction
 */
function create(args) {
    if (_.isEmpty(args.status))
        throw new argumentNull_1.default('status');
    if (!_.isArray(args.owners))
        throw new argument_1.default('owners', 'owner should be array');
    if (!_.isDate(args.expires_at))
        throw new argument_1.default('expires_at', 'expires_at should be Date');
    const clientUser = (args.client_user === undefined)
        ? ClientUserFactory.create({ client: '', state: '', scopes: [] })
        : args.client_user;
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        status: args.status,
        owners: args.owners,
        client_user: clientUser,
        expires_at: args.expires_at,
        expired_at: args.expired_at,
        started_at: args.started_at,
        closed_at: args.closed_at,
        inquiry_key: args.inquiry_key,
        tasks_exported_at: args.tasks_exported_at,
        // tslint:disable-next-line:max-line-length
        tasks_exportation_status: (args.tasks_exportation_status === undefined) ? transactionTasksExportationStatus_1.default.Unexported : args.tasks_exportation_status,
        tasks: (args.tasks === undefined) ? [] : args.tasks
    };
}
exports.create = create;
