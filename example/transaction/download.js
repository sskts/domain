/**
 * example
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

sskts.service.transaction.placeOrder.download(
    {
        dateFrom: moment().add(-1, 'day').toDate(),
        dateTo: moment().add(-1, 'day').toDate(),
    },
    'csv'
)(new sskts.repository.Transaction(sskts.mongoose.connection))
    .then((url) => {
        console.log('url:', url);
    });