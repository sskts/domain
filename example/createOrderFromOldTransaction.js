const mongoose = require('mongoose');
const MigrationService = require('../lib/service/migration');
const OrderRepo = require('../lib/repo/order').MongoRepository;
const FilmAdapter = require('../lib/v22/adapter/film').default;
const PerformanceAdapter = require('../lib/v22/adapter/performance').default;
const ScreenAdapter = require('../lib/v22/adapter/screen').default;
const TheaterAdapter = require('../lib/v22/adapter/theater').default;
const TransactionAdapter = require('../lib/v22/adapter/transaction').default;

async function main() {
    mongoose.connect(process.env.MONGOLAB_URI);
    const connection = mongoose.connection;

    const transactionId = '599bffcea7e4341e64aeb105'; // GMO & MVTK
    // const transactionId = '598bf5905b24ad16e83c73f9'; // GMO
    // const transactionId = '59673c4c6d16372074052cce'; // GMO & MVTK

    await MigrationService.createFromOldTransaction(transactionId)(
        new OrderRepo(connection),
        new TransactionAdapter(connection),
        new FilmAdapter(connection),
        new PerformanceAdapter(connection),
        new ScreenAdapter(connection),
        new TheaterAdapter(connection)
    );

    mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
