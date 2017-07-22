"use strict";
/**
 * オーソリ追加取引イベントファクトリー
 *
 * @namespace factory/transactionEvent/authorize
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const actionEventType_1 = require("../actionEventType");
const objectId_1 = require("../objectId");
/**
 *
 * @memberof tobereplaced$
 */
function create(args) {
    if (_.isEmpty(args.authorization))
        throw new argumentNull_1.default('authorization');
    if (!_.isDate(args.occurredAt))
        throw new argument_1.default('occurredAt', 'occurredAt should be Date');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        actionEventType: actionEventType_1.default.Authorize,
        occurredAt: args.occurredAt,
        authorization: args.authorization
    };
}
exports.create = create;
