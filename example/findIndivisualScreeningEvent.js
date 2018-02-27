/**
 * 個々の上映イベント取得
 *
 * @ignore
 */

const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const event = await sskts.service.offer.findIndividualScreeningEventByIdentifier('11816221020170720301300')({
        event: new sskts.repository.Event(sskts.mongoose.connection)
    });
    console.log('event:', event);

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
