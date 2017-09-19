/**
 * a sample importing screening events
 * @ignore
 */

const sskts = require('../');
const moment = require('moment');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.masterSync.importScreeningEvents(
        '118',
        moment().toDate(),
        moment().add(7, 'days').toDate(),
    )(
        new sskts.repository.Event(sskts.mongoose.connection),
        new sskts.repository.Place(sskts.mongoose.connection)
        );

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
