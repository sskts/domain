/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.master.importFilms('118')(sskts.adapter.theater(connection), sskts.adapter.film(connection));
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
