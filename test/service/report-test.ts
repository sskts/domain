/**
 * レポートサービステスト
 *
 * @ignore
 */
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('report service', () => {
    it('transactionStatuses ok', async () => {
        await sskts.service.report.transactionStatuses()(
            sskts.adapter.queue(connection),
            sskts.adapter.transaction(connection)
        );
    });
});
