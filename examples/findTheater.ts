/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';
import connectionOptions from './connectionOptions';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI, connectionOptions);

        const theater = await sskts.service.master.findTheater('118')(sskts.createTheaterRepository(mongoose.connection));
        console.log(theater);

        mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

main();
