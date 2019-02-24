const moment = require('moment');
const mongoose = require('mongoose');

const sskts = require('../');

async function main() {
    await mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.masterSync.importScreeningEvents({
        locationBranchCode: '002',
        importFrom: new Date(),
        importThrough: moment().add(5, 'weeks').toDate()
    })({
        event: new sskts.repository.Event(mongoose.connection),
        place: new sskts.repository.Place(mongoose.connection),
        seller: new sskts.repository.Seller(mongoose.connection)
    });

    await mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
