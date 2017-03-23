/* tslint:disable */
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
        await sskts.service.master.importPerformances('118', '20170325', '20170401')(
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
