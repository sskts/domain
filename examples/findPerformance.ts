/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const performance = await sskts.service.master.findPerformance('1182017022848278022120')(sskts.createPerformanceAdapter(connection));
        console.log(performance);
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
