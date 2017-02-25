/* tslint:disable */
import * as mongoose from 'mongoose';
import * as SSKTS from '../lib/sskts-domain';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        await SSKTS.MasterService.importFilms('118')(SSKTS.createTheaterRepository(connection), SSKTS.createFilmRepository(connection));
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

main();