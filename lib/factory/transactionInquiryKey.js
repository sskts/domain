/**
 * 取引照会キーファクトリー
 *
 * @namespace TransactionInquiryKeyFactory
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function create(args) {
    return {
        theater_code: args.theater_code,
        reserve_num: args.reserve_num,
        tel: args.tel
    };
}
exports.create = create;
