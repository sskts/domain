const sskts = require('../lib');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
    await eventRepo.eventModel.remove(
        { typeOf: sskts.factory.eventType.ScreeningEvent }
    ).exec();

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
