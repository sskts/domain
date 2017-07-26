/**
 * 劇場インポートサンプル
 *
 * @ignore
 */

import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.place.importMovieTheater('118')(sskts.adapter.place(connection));
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
