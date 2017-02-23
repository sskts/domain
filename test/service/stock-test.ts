// tslint:disable-next-line:missing-jsdoc
import * as assert from 'assert';
import * as mongoose from 'mongoose';

import Transaction from '../../lib/model/transaction';
import * as SSKTS from '../../lib/sskts-domain';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('stock service', () => {
    it('disableTransactionInquiry key not exists.', (done) => {
        const transaction = Transaction.create({
            status: 'UNDERWAY',
            owners: [],
            expired_at: new Date()
        });

        SSKTS.StockService.disableTransactionInquiry(transaction)(
            SSKTS.createTransactionRepository(connection)
        ).then(() => {
            done(new Error('unexpected.'));
        }).catch((err) => {
            assert(err instanceof RangeError);
            done();
        });
    });
});
