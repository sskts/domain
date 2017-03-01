"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:missing-jsdoc
const assert = require("assert");
const mongoose = require("mongoose");
const transaction_1 = require("../../lib/model/transaction");
const sskts = require("../../lib/index");
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('stock service', () => {
    it('disableTransactionInquiry key not exists.', (done) => {
        const transaction = transaction_1.default.create({
            status: 'UNDERWAY',
            owners: [],
            expired_at: new Date()
        });
        sskts.service.stock.disableTransactionInquiry(transaction)(sskts.createTransactionRepository(connection)).then(() => {
            done(new Error('unexpected.'));
        }).catch((err) => {
            assert(err instanceof RangeError);
            done();
        });
    });
});
