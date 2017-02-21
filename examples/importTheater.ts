/* tslint:disable */
import * as mongoose from 'mongoose';
import * as SSKTS from '../lib/sskts-domain';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI);

        await SSKTS.MasterService.importTheater('118')(SSKTS.createTheaterRepository(mongoose.connection));
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
    process.exit(0);
}

main();
