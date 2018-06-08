/**
 * 取引CSVダウンロードサンプル
 * @ignore
 */
const fs = require('fs');
const moment = require('moment');
const sskts = require('../../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const csv = await sskts.service.report.transaction.download(
        {
            startFrom: moment().add(-1, 'day').toDate(),
            startThrough: moment().toDate()
        },
        'csv'
    )({
        order: new sskts.repository.Order(sskts.mongoose.connection),
        transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
    });
    console.log(csv);
    // fs.writeFileSync(`${__dirname}/transactions.csv`, csv);

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
