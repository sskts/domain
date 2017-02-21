// tslint:disable-next-line:missing-jsdoc
import * as mongoose from 'mongoose';
import * as SSKTS from '../../lib/sskts-domain';

mongoose.connect(process.env.MONGOLAB_URI).then(
    () => {
        console.error('connected.');
    },
    (err) => {
        console.error(err);
    }
);

describe('transaction service', () => {
    it('export queues', async () => {
        await SSKTS.TransactionService.exportQueues('58ab949eedc005093c5fe3c6')(
            SSKTS.createTransactionRepository(mongoose.connection),
            SSKTS.createQueueRepository(mongoose.connection)
        );
    });
});
