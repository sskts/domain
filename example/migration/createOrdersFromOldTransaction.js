/**
 * v22→v23データ移行サンプル
 * v22の取引データからv23にデータ(取引の型追加、注文作成、所有権作成)を作成する
 * @ignore
 */

const moment = require('moment');
const mongoose = require('mongoose');

const MigrationService = require('../../lib/service/migration');

const EventRepo = require('../../lib/repo/event').MongoRepository;
const OrderRepo = require('../../lib/repo/order').MongoRepository;
const OrganizationRepo = require('../../lib/repo/organization').MongoRepository;
const OwnershipInfoRepo = require('../../lib/repo/ownershipInfo').MongoRepository;

const PerformanceAdapter = require('../../lib/v22/adapter/performance').default;
const TransactionAdapter = require('../../lib/v22/adapter/transaction').default;

async function main() {
    mongoose.connect(process.env.MONGOLAB_URI);
    const connection = mongoose.connection;

    const transactionAdapter = new TransactionAdapter(connection);
    // 最近の成立取引リストを取得
    const transactionIds = await transactionAdapter.transactionModel.find(
        {
            closed_at: { $gt: moment('2017-08-01T00:00:00+09:00').toDate() },
            status: 'CLOSED'
        },
        'id'
    ).exec().then((docs) => docs.map((doc) => doc.get('id')));

    await Promise.all(transactionIds.map(async (transactionId) => {
        // テスト環境
        // const transactionId = '5959fedbd5aeb81bc0236a16'; // GMO
        // const transactionId = '595a0030d5aeb81bc0236acd'; // GMO & MVTK
        // const transactionId = '595a0ef5d5aeb81bc0236b27'; // MVTK

        // 開発環境
        // const transactionId = '59b40b6a654267167cad0ed0'; // GMO

        await MigrationService.createFromOldTransaction(transactionId)(
            new EventRepo(connection),
            new OrderRepo(connection),
            new OwnershipInfoRepo(connection),
            new OrganizationRepo(connection),
            new TransactionAdapter(connection),
            new PerformanceAdapter(connection)
        );
    }));

    console.log('migrated.', transactionIds);

    mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
