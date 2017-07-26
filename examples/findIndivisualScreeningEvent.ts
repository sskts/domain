/**
 * 個々の上映イベント取得
 *
 * @ignore
 */

import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const event = await sskts.service.event.findIndividualScreeningEventByIdentifier('11816221020170720301300')(
            sskts.adapter.event(connection)
        );
        // tslint:disable-next-line:no-console
        console.log(event.get());
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main().then(() => {
    // tslint:disable-next-line:no-console
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
