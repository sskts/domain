/**
 * 取引検索サンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI, { useMongoClient: true });

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
            telephone: '12345678'
        }
    },
    result: {
        order: {
            confirmationNumber: 51097,
            paymentMethods: [sskts.factory.paymentMethodType.CreditCard]
        }
    }
};

transactionRepo.searchPlaceOrder(conditions)
    .then(async (transactions) => {
        console.log('transactions are', transactions);
        console.log('transactions length is', transactions.length);
    }).catch((err) => {
        console.error(err);
    }).then(() => {
        sskts.mongoose.disconnect();
    });