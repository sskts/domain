/* tslint:disable */
import * as mongoose from 'mongoose';
import * as SSKTS from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const performance = await SSKTS.MasterService.findPerformance('1182017022848278022120')(SSKTS.createPerformanceRepository(connection));
        console.log(performance);
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

main();
