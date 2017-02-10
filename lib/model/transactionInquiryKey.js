"use strict";
class TransactionInquiryKey {
    constructor(theater_code, reserve_num, tel) {
        this.theater_code = theater_code;
        this.reserve_num = reserve_num;
        this.tel = tel;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionInquiryKey;
