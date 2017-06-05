/* tslint:disable */
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as redis from 'redis';
import * as sskts from '../lib/index';

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
        const performances = await sskts.service.master.searchPerformances({
            day: moment().format('YYYYMMDD'),
            theater: '118'
        })(
            sskts.adapter.performance(connection),
            sskts.adapter.stockStatus.performance(redisClient)
            );
        console.log(performances);
    } catch (error) {
        console.error(error);
    }

    redisClient.quit();
    mongoose.disconnect();
}

main();
