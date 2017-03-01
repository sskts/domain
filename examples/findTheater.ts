/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const theater = await sskts.service.master.findTheater('118')(sskts.createTheaterRepository(connection));
        console.log(theater);
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
    process.exit(0);
}

main();
