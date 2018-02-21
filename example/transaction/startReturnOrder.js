/**
 * 注文返品取引サンプル
 * @ignore
 */

const moment = require('moment');
const request = require('request-promise-native');
const sskts = require('../../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const agentId = 'agentId';

    const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
    const transaction = await sskts.service.transaction.returnOrder.start({
        // tslint:disable-next-line:no-magic-numbers
        expires: moment().add(30, 'minutes').toDate(),
        agentId: agentId,
        transactionId: '5a780eee3e641317d4575767',
        cancellationFee: 0,
        clientUser: {},
        reason: 'Seller'
    })(transactionRepo);
    console.log('transaction started.', transaction.id);

    await sskts.service.transaction.returnOrder.confirm(agentId, transaction.id)(transactionRepo);
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
}).then(() => {
    sskts.mongoose.disconnect();
});