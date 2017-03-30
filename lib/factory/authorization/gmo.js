"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * GMOオーソリファクトリー
 *
 * @namespace GMOAuthorizationFactory
 */
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
function create(args) {
    if (_.isEmpty(args.owner_from))
        throw new argumentNull_1.default('owner_from');
    if (_.isEmpty(args.owner_to))
        throw new argumentNull_1.default('owner_to');
    if (_.isEmpty(args.gmo_shop_id))
        throw new argumentNull_1.default('gmo_shop_id');
    if (_.isEmpty(args.gmo_shop_pass))
        throw new argumentNull_1.default('gmo_shop_pass');
    if (_.isEmpty(args.gmo_order_id))
        throw new argumentNull_1.default('gmo_order_id');
    if (_.isEmpty(args.gmo_access_id))
        throw new argumentNull_1.default('gmo_access_id');
    if (_.isEmpty(args.gmo_access_pass))
        throw new argumentNull_1.default('gmo_access_pass');
    if (!_.isNumber(args.price))
        throw new argument_1.default('price', 'price should be number');
    if (!_.isNumber(args.gmo_amount))
        throw new argument_1.default('gmo_amount', 'gmo_amount should be number');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: authorizationGroup_1.default.GMO,
        price: args.price,
        owner_from: args.owner_from,
        owner_to: args.owner_to,
        gmo_shop_id: args.gmo_shop_id,
        gmo_shop_pass: args.gmo_shop_pass,
        gmo_order_id: args.gmo_order_id,
        gmo_amount: args.gmo_amount,
        gmo_access_id: args.gmo_access_id,
        gmo_access_pass: args.gmo_access_pass,
        gmo_job_cd: args.gmo_job_cd,
        gmo_pay_type: args.gmo_pay_type
    };
}
exports.create = create;
