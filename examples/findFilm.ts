/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const filmOption = await sskts.service.master.findFilm('118170620')(sskts.createFilmAdapter(connection));
        console.log(filmOption);
    } catch (error) {
        console.error(error);
    }
    console.log('disconnecting...');
    mongoose.disconnect();
}

main();
