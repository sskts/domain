"use strict";
/**
 * 注文照会キーファクトリー
 *
 * @namespace factory/orderInquiryKey
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../error/argument");
const argumentNull_1 = require("../error/argumentNull");
function create(args) {
    if (_.isEmpty(args.theaterCode))
        throw new argumentNull_1.default('theaterCode');
    if (!_.isNumber(args.orderNumber))
        throw new argument_1.default('orderNumber', 'orderNumber should be number');
    if (_.isEmpty(args.telephone))
        throw new argumentNull_1.default('telephone');
    return args;
}
exports.create = create;
