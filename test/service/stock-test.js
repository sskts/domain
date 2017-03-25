"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 在庫サービステスト
 *
 * @ignore
 */
const assert = require("assert");
const mongoose = require("mongoose");
const TransactionFactory = require("../../lib/factory/transaction");
const sskts = require("../../lib/index");
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('stock service', () => {
    it('disableTransactionInquiry key not exists.', () => __awaiter(this, void 0, void 0, function* () {
        const transaction = TransactionFactory.create({
            status: 'UNDERWAY',
            owners: [],
            expires_at: new Date()
        });
        let disableTransactionInquiryError;
        try {
            yield sskts.service.stock.disableTransactionInquiry(transaction)(sskts.adapter.transaction(connection));
        }
        catch (error) {
            disableTransactionInquiryError = error;
        }
        assert(disableTransactionInquiryError instanceof Error);
    }));
});
