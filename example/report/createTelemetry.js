/**
 * 測定データ作成サンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.report.createTelemetry({
        measuredAt: moment('2017-11-02T15:42:00Z').toDate(),
        sellerId: '597ef619dc1c36fbddb0e597'
    })(
        new sskts.repository.Task(sskts.mongoose.connection),
        new sskts.repository.Telemetry(sskts.mongoose.connection),
        new sskts.repository.Transaction(sskts.mongoose.connection),
        new sskts.repository.action.Authorize(sskts.mongoose.connection)
        );

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
