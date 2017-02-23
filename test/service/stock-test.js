"use strict";
// tslint:disable-next-line:missing-jsdoc
const assert = require("assert");
const COA = require("@motionpicture/coa-service");
const mongoose = require("mongoose");
const transaction_1 = require("../../lib/model/transaction");
const SSKTS = require("../../lib/sskts-domain");
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
        SSKTS.StockService.disableTransactionInquiry(transaction)(SSKTS.createTransactionRepository(connection), COA).then(() => {
            done(new Error('unexpected.'));
        }).catch((err) => {
            assert(err instanceof RangeError);
            done();
        });
    });
});
