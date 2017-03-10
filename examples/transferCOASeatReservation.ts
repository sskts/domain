/**
 * COA仮予約資産移動
 *
 * @ignore
 */
import * as mongoose from 'mongoose';
import * as util from 'util';
import * as sskts from '../lib/index';

async function main() {
    (<any>mongoose).Promise = global.Promise;
    mongoose.connect(process.env.MONGOLAB_URI);

    const queueAdapter = sskts.createQueueAdapter(mongoose.connection);
    const assetAdapter = sskts.createAssetAdapter(mongoose.connection);

    // 未実行のCOA資産移動キューを取得
    const option = await queueAdapter.findOneSettleCOASeatReservationAuthorizationAndUpdate(
        {
            _id: '58c1262196970616d0fe2e30'
        },
        {
        }
    );

    if (!option.isEmpty) {
        const queue = option.get();
        console.log(util.inspect(queue, { showHidden: true, depth: 10 }));

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await sskts.service.stock.transferCOASeatReservation(queue.authorization)(assetAdapter);
        } catch (error) {
            console.error(error);
        }
    }

    mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
