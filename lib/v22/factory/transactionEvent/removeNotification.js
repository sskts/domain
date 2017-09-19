"use strict";
/**
 * 通知削除取引イベントファクトリー
 *
 * @namespace factory/transactionEvent/removeNotification
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const objectId_1 = require("../objectId");
const transactionEventGroup_1 = require("../transactionEventGroup");
/**
 *
 * @memberof tobereplaced$
 */
function create(args) {
    if (_.isEmpty(args.transaction))
        throw new argumentNull_1.default('transaction');
    if (_.isEmpty(args.notification))
        throw new argumentNull_1.default('notification');
    if (!_.isDate(args.occurred_at))
        throw new argument_1.default('occurred_at', 'occurred_at should be Date');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: transactionEventGroup_1.default.REMOVE_NOTIFICATION,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        notification: args.notification
    };
}
exports.create = create;
