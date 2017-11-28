/**
 * a samples updating item availability of screening events
 * @ignore
 */

const sskts = require('../');
const moment = require('moment');

async function main() {
    const redisClient = sskts.redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: parseInt(process.env.TEST_REDIS_PORT, 10),
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    const IMPORT_TERMS_IN_DAYS = 7;
    const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(redisClient);

    try {
        await sskts.service.itemAvailability.updateIndividualScreeningEvents(
            '118',
            moment().toDate(),
            moment().add(IMPORT_TERMS_IN_DAYS, 'days').toDate()
        )(itemAvailabilityRepo);
        console.log('item availability updated');
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
