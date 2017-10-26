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
            day: moment().format('YYYYMMDD'),
            theater: '118'
        })(new sskts.repository.Event(sskts.mongoose.connection));
        console.log(events.length);
        console.log(events[0].name);
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
