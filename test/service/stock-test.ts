/**
 * 在庫サービステスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as mongoose from 'mongoose';

import * as TransactionFactory from '../../lib/factory/transaction';
import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('stock service', () => {
    it('disableTransactionInquiry key not exists.', async () => {
        const transaction = TransactionFactory.create({
            status: 'UNDERWAY',
            owners: [],
            expires_at: new Date()
        });

        let disableTransactionInquiryError: any;
        try {
            await sskts.service.stock.disableTransactionInquiry(transaction)(
                sskts.adapter.transaction(connection)
            );
        } catch (error) {
            disableTransactionInquiryError = error;
        }

        assert(disableTransactionInquiryError instanceof Error);
    });
});
