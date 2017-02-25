/* tslint:disable */
import * as mongoose from 'mongoose';
import * as SSKTS from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        await SSKTS.MasterService.importScreens('118')(SSKTS.createTheaterRepository(connection), SSKTS.createScreenRepository(connection));
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

main();
