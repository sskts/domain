/**
 * 上映会イベント検索サンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../');

async function main() {
    let redisClient;
    try {
        await sskts.mongoose.connect(process.env.MONGOLAB_URI);
        redisClient = sskts.redis.createClient({
            host: process.env.TEST_REDIS_HOST,
            port: parseInt(process.env.TEST_REDIS_PORT, 10),
            password: process.env.TEST_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });

        const events = await sskts.service.offer.searchIndividualScreeningEvents({
            // day: moment().format('YYYYMMDD'),
            // superEventLocationIdentifiers: ['MovieTheater-112', 'MovieTheater-118'],
            startFrom: moment().toDate(),
            startThrough: moment().add(2, 'day').toDate()
        })({
            event: new sskts.repository.Event(sskts.mongoose.connection),
            itemAvailability: new sskts.repository.itemAvailability.IndividualScreeningEvent(redisClient)
        });
        console.log(events.length);
        console.log(events[0]);
    } catch (error) {
        console.error(error);
    }

    redisClient.quit();
    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
