/* tslint:disable */
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const filmAdapter = sskts.adapter.film(connection);
        const screenAdapter = sskts.adapter.screen(connection);
        const performanceAdapter = sskts.adapter.performance(connection);

        await performanceAdapter.model.remove({}).exec();
        await sskts.service.master.importPerformances('118', moment().format('YYYYMMDD'), moment().add(7, 'days').format('YYYYMMDD'))(
            filmAdapter,
            screenAdapter,
            performanceAdapter
        );
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
