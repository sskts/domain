/**
 * 取引タスクエクスポートサンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.transaction.placeOrder.exportTasks(sskts.factory.transactionStatusType.Confirmed)({
        task: new sskts.repository.Task(sskts.mongoose.connection),
        transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
    });

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
