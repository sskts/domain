// tslint:disable-next-line:missing-jsdoc
import * as mongoose from 'mongoose';
import * as SSKTS from '../../lib/index';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('transaction service', () => {
    it('export queues', async () => {
        await SSKTS.TransactionService.exportQueues('58ab949eedc005093c5fe3c6')(
            SSKTS.createTransactionRepository(connection),
            SSKTS.createQueueRepository(connection)
        );
    });
});
