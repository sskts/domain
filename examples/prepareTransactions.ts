/**
 * 取引在庫準備
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import * as sskts from '../lib/index';

const debug = createDebug('sskts-domain:examples:prepareTransactions');

async function main() {
    (<any>mongoose).Promise = global.Promise;
    const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const transactionAdapter = sskts.adapter.transaction(connection);

    await transactionAdapter.transactionModel.remove({}).exec();
    // tslint:disable-next-line:no-magic-numbers
    await sskts.service.transaction.prepare(1, 60)(transactionAdapter);

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
