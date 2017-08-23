/**
 * a samples finding item availability of screening events
 *
 * @ignore
 */

const sskts = require('../lib/index');
const moment = require('moment');

async function main() {
    const redisClient = sskts.redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: parseInt(process.env.TEST_REDIS_PORT, 10),
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    const performanceStockStatusAdapter = sskts.adapter.itemAvailability.individualScreeningEvent(redisClient);

    try {
        const availability = await performanceStockStatusAdapter.findOne('20170830', '11899300020170830402035');
        console.log('availability:', availability);
    } catch (error) {
        console.error(error);
    }

    redisClient.quit();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
