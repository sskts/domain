"use strict";
const transactionInquiryKey_1 = require("../model/transactionInquiryKey");
/**
 * 取引照会キーファクトリー
 *
 * @namespace
 */
var TransactionInquiryKeyFactory;
(function (TransactionInquiryKeyFactory) {
    function create(args) {
        return new transactionInquiryKey_1.default(args.theater_code, args.reserve_num, args.tel);
    }
    TransactionInquiryKeyFactory.create = create;
})(TransactionInquiryKeyFactory || (TransactionInquiryKeyFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionInquiryKeyFactory;
