/**
 * タスク名でタスクを実行するサンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

const debug = createDebug('sskts-domain:examples');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

async function main() {
    await sskts.service.task.executeByName(sskts.factory.taskName.SettleSeatReservationAuthorization)(
        sskts.adapter.task(mongoose.connection),
        mongoose.connection
    );

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
