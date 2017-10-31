/**
 * 取引検索サンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
const conditions = {
    startFrom: moment('2017-10-23T22:46:30Z').toDate(),
    startThrough: moment('2017-10-23T22:46:40Z').toDate(),
    status: sskts.factory.transactionStatusType.Confirmed,
    sellerId: "59d20831e53ebc2b4e774466",
    object: {
        customerContact: {
            name: 'john',
            email: 'motionpicture.JP',
            telephone: '09012345678'
        }
    }
};
transactionRepo.searchPlaceOrder(conditions).then(async (transactions) => {
    console.log('transactions are', transactions);
    console.log('transactions length is', transactions.length);

    sskts.mongoose.disconnect();
});