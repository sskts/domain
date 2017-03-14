/**
 * 取引キューエクスポート
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

const debug = createDebug('sskts-api:*');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

/**
 * キューエクスポートを実行する
 *
 * @ignore
 */
async function main() {
    const transactionAdapter = sskts.createTransactionAdapter(mongoose.connection);

    const doc = await transactionAdapter.transactionModel.findOneAndUpdate(
        {
            _id: '58c1619daefa8e0c80605e40'
        },
        {
        }
    ).exec();

    if (doc) {
        const transaction = <any>doc.toObject();
        debug('transaction is', transaction);

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await sskts.service.transaction.exportQueues(transaction.id.toString())(
            transactionAdapter,
            sskts.createQueueAdapter(mongoose.connection)
        );
    }

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
