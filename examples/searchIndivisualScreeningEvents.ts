/**
 * 上映会イベント検索
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as redis from 'redis';
import * as sskts from '../lib/index';

const debug = createDebug('sskts-domain:examples');

async function main() {
    const redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const performances = await sskts.service.master.searchIndivisualScreeningEvents({
            day: moment().format('YYYYMMDD'),
            theater: '118'
        })(
            sskts.adapter.event(connection)
            // sskts.adapter.stockStatus.performance(redisClient)
            );
        debug(performances);
    } catch (error) {
        console.error(error);
    }

    redisClient.quit();
    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
