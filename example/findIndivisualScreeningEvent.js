/**
 * 個々の上映イベント取得
 *
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const event = await sskts.service.event.findIndividualScreeningEventByIdentifier('11816221020170720301300')(
        new sskts.repository.Event(sskts.mongoose.connection)
    );
    console.log('event:', event);

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
