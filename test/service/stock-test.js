"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 在庫サービステスト
 *
 * @ignore
 */
const assert = require("assert");
const mongoose = require("mongoose");
const Transaction = require("../../lib/factory/transaction");
const sskts = require("../../lib/index");
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('stock service', () => {
    it('disableTransactionInquiry key not exists.', (done) => {
        const transaction = Transaction.create({
            status: 'UNDERWAY',
            owners: [],
            expires_at: new Date()
        });
        sskts.service.stock.disableTransactionInquiry(transaction)(sskts.adapter.transaction(connection)).then(() => {
            done(new Error('unexpected.'));
        }).catch((err) => {
            assert(err instanceof RangeError);
            done();
        });
    });
});
