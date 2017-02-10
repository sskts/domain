/**
 * 取引照会キーファクトリー
 *
 * @namespace TransactionInquiryKeyFactory
 */
"use strict";
const transactionInquiryKey_1 = require("../model/transactionInquiryKey");
function create(args) {
    return new transactionInquiryKey_1.default(args.theater_code, args.reserve_num, args.tel);
}
exports.create = create;
