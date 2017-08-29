/**
 * a sample importing screening events
 *
 * @ignore
 */

const sskts = require('../lib/index');
const moment = require('moment');

async function main() {
    try {
        const connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.event.importScreeningEvents(
            '118',
            moment().toDate(),
            moment().add(7, 'days').toDate(),
        )(sskts.adapter.event(connection), sskts.adapter.place(connection));
    } catch (error) {
        console.error(error);
    }

    sskts.mongoose.disconnect();
}

main();
