// tslint:disable-next-line:missing-jsdoc
import * as mongoose from 'mongoose';
// import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('transaction service', () => {
    // it('export queues', async () => {
    //     await sskts.service.transaction.exportQueues('58ab949eedc005093c5fe3c6')(
    //         sskts.createTransactionRepository(connection),
    //         sskts.createQueueRepository(connection)
    //     );
    // });
});
