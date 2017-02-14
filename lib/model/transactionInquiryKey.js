"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionInquiryKey;
