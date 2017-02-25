/* tslint:disable */
import * as mongoose from 'mongoose';
import * as SSKTS from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const performances = await SSKTS.MasterService.searchPerformances({
            day: '20170228'
        })(SSKTS.createPerformanceRepository(connection));
        console.log(performances);
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

main();
