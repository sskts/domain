/**
 * GMO売上健康診断
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.report.health.checkGMOSales({
        madeFrom: moment().add(-1, 'day').toDate(),
        madeThrough: moment().toDate()
    })(
        new sskts.repository.GMONotification(sskts.mongoose.connection),
        new sskts.repository.Action(sskts.mongoose.connection),
    );

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
