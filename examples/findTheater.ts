/* tslint:disable */
import * as mongoose from 'mongoose';
import * as SSKTS from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const theater = await SSKTS.MasterService.findTheater('118')(SSKTS.createTheaterRepository(connection));
        console.log(theater);
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
    process.exit(0);
}

main();
