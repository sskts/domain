const sskts = require('../lib/index');
const FilmAdapter = require('../lib/oldAdapter/film');
const PerformanceAdapter = require('../lib/oldAdapter/performance');
const ScreenAdapter = require('../lib/oldAdapter/screen');
const TheaterAdapter = require('../lib/oldAdapter/theater');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);


    const transactionId = '599bffcea7e4341e64aeb105'; // GMO & MVTK
    // const transactionId = '598bf5905b24ad16e83c73f9'; // GMO
    // const transactionId = '59673c4c6d16372074052cce'; // GMO & MVTK

    await sskts.service.order.createFromOldTransaction(transactionId)(
        sskts.adapter.order(sskts.mongoose.connection),
        sskts.adapter.transaction(sskts.mongoose.connection),
        new FilmAdapter.default(sskts.mongoose.connection),
        new PerformanceAdapter.default(sskts.mongoose.connection),
        new ScreenAdapter.default(sskts.mongoose.connection),
        new TheaterAdapter.default(sskts.mongoose.connection)
    );

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
