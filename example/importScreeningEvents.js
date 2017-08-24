/**
 * a sample importing screening events
 *
 * @ignore
 */

const sskts = require('../lib/index');

async function main() {
    try {
        const connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.event.importScreeningEvents(
            '118',
            '20180601',
            '20180608',
        )(sskts.adapter.event(connection), sskts.adapter.place(connection));
    } catch (error) {
        console.error(error);
    }

    sskts.mongoose.disconnect();
}

main();
