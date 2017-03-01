"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:variable-name
/**
 * 取引照会キー
 *
 * @class TransactionInquiryKey
 *
 * @param {string} theater_code
 * @param {number} reserve_num
 * @param {string} tel
 */
class TransactionInquiryKey {
    constructor(theater_code, reserve_num, tel) {
        this.theater_code = theater_code;
        this.reserve_num = reserve_num;
        this.tel = tel;
        // todo validation
    }
}
(function (TransactionInquiryKey) {
    function create(args) {
        return new TransactionInquiryKey(args.theater_code, args.reserve_num, args.tel);
    }
    TransactionInquiryKey.create = create;
})(TransactionInquiryKey || (TransactionInquiryKey = {}));
exports.default = TransactionInquiryKey;
