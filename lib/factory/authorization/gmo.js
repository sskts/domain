"use strict";
/**
 * GMOオーソリファクトリー
 *
 * @namespace factory/authorization/gmo
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
function create(args) {
    if (_.isEmpty(args.agent))
        throw new argumentNull_1.default('agent');
    if (_.isEmpty(args.recipient))
        throw new argumentNull_1.default('recipient');
    if (!_.isNumber(args.price))
        throw new argument_1.default('price', 'price should be number');
    if (args.price <= 0)
        throw new argument_1.default('price', 'price should be greater than 0');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: authorizationGroup_1.default.GMO,
        price: args.price,
        agent: args.agent,
        recipient: args.recipient,
        result: args.result,
        object: args.object
    };
}
exports.create = create;
