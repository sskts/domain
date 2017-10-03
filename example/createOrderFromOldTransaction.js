/**
 * v22→v23データ移行サンプル
 * @ignore
 */

const mongoose = require('mongoose');

const MigrationService = require('../lib/service/migration');

const EventRepo = require('../lib/repo/event').MongoRepository;
const OrderRepo = require('../lib/repo/order').MongoRepository;
const OrganizationRepo = require('../lib/repo/organization').MongoRepository;

const FilmAdapter = require('../lib/v22/adapter/film').default;
const PerformanceAdapter = require('../lib/v22/adapter/performance').default;
const ScreenAdapter = require('../lib/v22/adapter/screen').default;
const TheaterAdapter = require('../lib/v22/adapter/theater').default;
const TransactionAdapter = require('../lib/v22/adapter/transaction').default;

async function main() {
    mongoose.connect(process.env.MONGOLAB_URI);
    const connection = mongoose.connection;

    // const transactionId = '5959fedbd5aeb81bc0236a16'; // GMO
    const transactionId = '595a0030d5aeb81bc0236acd'; // GMO & MVTK
    // const transactionId = '595a0ef5d5aeb81bc0236b27'; // MVTK

    await MigrationService.createFromOldTransaction(transactionId)(
        new EventRepo(connection),
        new OrderRepo(connection),
        new OrganizationRepo(connection),
        new TransactionAdapter(connection),
        new FilmAdapter(connection),
        new PerformanceAdapter(connection),
        new ScreenAdapter(connection)
    );

    mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
