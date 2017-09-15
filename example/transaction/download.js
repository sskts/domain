/**
 * download transactions csv example
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

sskts.service.transaction.placeOrder.download(
    {
        startFrom: moment().add(-1, 'hours').toDate(),
        startThrough: moment().toDate(),
    },
    'csv'
)(new sskts.repository.Transaction(sskts.mongoose.connection))
    .then(async (csv) => {
        const fileName = `sskts-line-assistant-transactions-${moment().format('YYYYMMDDHHmmss')}.csv`;
        const url = await sskts.service.util.uploadFile({
            fileName: fileName,
            text: csv
        })();
        console.log('url:', url);
    });