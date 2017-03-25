"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引照会キーファクトリー
 *
 * @namespace TransactionInquiryKeyFactory
 */
const validator = require("validator");
const argument_1 = require("../error/argument");
const argumentNull_1 = require("../error/argumentNull");
function create(args) {
    if (validator.isEmpty(args.theater_code))
        throw new argumentNull_1.default('theater_code');
    if (!validator.isInt(args.reserve_num.toString()))
        throw new argument_1.default('reserve_num', 'reserve_num should be number');
    return {
        theater_code: args.theater_code,
        reserve_num: args.reserve_num,
        tel: args.tel
    };
}
exports.create = create;
