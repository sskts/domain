/**
 * a sample importing screening events
 * @ignore
 */

const sskts = require('../');
const moment = require('moment');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await Promise.all(['118', '112'].map(async (theaterCode) => {
        await sskts.service.masterSync.importScreeningEvents(
            theaterCode,
            moment().toDate(),
            moment().add(5, 'weeks').toDate(),
        )(
            new sskts.repository.Event(sskts.mongoose.connection),
            new sskts.repository.Place(sskts.mongoose.connection)
            );
    }));

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
