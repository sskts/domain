/* tslint:disable */
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const performances = await sskts.service.master.searchPerformances({
            day: moment().format('YYYYMMDD'),
            theater: '118'
        })(
            sskts.adapter.performance(connection),
            sskts.adapter.stockStatus.performance(process.env.TEST_REDIS_URL)
            );
        console.log(performances);
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
