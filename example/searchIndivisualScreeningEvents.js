/**
 * 上映会イベント検索サンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../');

async function main() {
    try {
        sskts.mongoose.connect(process.env.MONGOLAB_URI);
        const events = await sskts.service.event.searchIndividualScreeningEvents({
            // day: moment().format('YYYYMMDD'),
            locationBranchCodes: ['112', '118'],
            startFrom: moment().toDate(),
            startThrough: moment().add(1, 'day').toDate(),
            // endFrom: moment().add(3, 'hour').toDate(),
            // endThrough: moment().add(1, 'day').toDate()
        })(new sskts.repository.Event(sskts.mongoose.connection));
        console.log(events.length);
        console.log(events.map((event) => event.startDate));
    } catch (error) {
        console.error(error);
    }

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
