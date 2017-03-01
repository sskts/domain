/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.master.importScreens('118')(sskts.createTheaterRepository(connection), sskts.createScreenRepository(connection));
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

main();
