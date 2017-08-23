const mongoose = require('mongoose');
const MigrationService = require('../lib/service/migration');
const OrderAdapter = require('../lib/adapter/order');
const FilmAdapter = require('../lib/v22/adapter/film');
const PerformanceAdapter = require('../lib/v22/adapter/performance');
const ScreenAdapter = require('../lib/v22/adapter/screen');
const TheaterAdapter = require('../lib/v22/adapter/theater');
const TransactionAdapter = require('../lib/v22/adapter/transaction');

async function main() {
    mongoose.connect(process.env.MONGOLAB_URI);
    const connection = mongoose.connection;

    const transactionId = '599bffcea7e4341e64aeb105'; // GMO & MVTK
    // const transactionId = '598bf5905b24ad16e83c73f9'; // GMO
    // const transactionId = '59673c4c6d16372074052cce'; // GMO & MVTK

    await MigrationService.createFromOldTransaction(transactionId)(
        new OrderAdapter.default(connection),
        new TransactionAdapter.default(connection),
        new FilmAdapter.default(connection),
        new PerformanceAdapter.default(connection),
        new ScreenAdapter.default(connection),
        new TheaterAdapter.default(connection)
    );

    mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
