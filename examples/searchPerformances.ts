/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const performances = await sskts.service.master.searchPerformances({
            day: '20170328',
            theater: '118'
        })(sskts.adapter.performance(connection));
        console.log(performances);
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
