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
    const transactionRepository = sskts.createTransactionRepository(mongoose.connection);

    const option = await transactionRepository.findOneAndUpdate(
        {
            _id: '58c1619daefa8e0c80605e40'
        },
        {
        }
    );

    if (!option.isEmpty) {
        const transaction = option.get();
        debug('transaction is', transaction);

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await sskts.service.transaction.exportQueues(transaction.id.toString())(
            transactionRepository,
            sskts.createQueueRepository(mongoose.connection)
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
