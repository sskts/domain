/**
 * 個々の上映会イベントインポートサンプル
 *
 * @ignore
 */

import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.event.importIndividualScreeningEvents(
            '118',
            moment().toDate(),
            moment().add(1, 'week').toDate()
        )(sskts.adapter.event(connection), sskts.adapter.place(connection));
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
