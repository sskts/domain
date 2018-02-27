/**
 * 測定データ作成サンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.report.createTelemetry({
        measuredAt: moment('2017-11-26T13:37:00Z').toDate(),
        sellerId: '59d20831e53ebc2b4e774466'
    })(
        new sskts.repository.Task(sskts.mongoose.connection),
        new sskts.repository.Telemetry(sskts.mongoose.connection),
        new sskts.repository.Transaction(sskts.mongoose.connection),
        new sskts.repository.action.Authorize(sskts.mongoose.connection)
    );

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
