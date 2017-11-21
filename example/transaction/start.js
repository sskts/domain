/**
 * start placeOrder transaction sample.
 * @ignore
 */

const moment = require('moment');
const request = require('request-promise-native');
const sskts = require('../../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    // 許可証トークンパラメーターがなければ、WAITERで許可証を取得
    const passportToken = await request.post(
        `${process.env.WAITER_ENDPOINT}/passports`,
        {
            body: {
                scope: `placeOrderTransaction.59d20831e53ebc2b4e774466`
            },
            json: true
        }
    ).then((body) => body.token);
    console.log('passportToken published.', passportToken);

    await Promise.all(Array.from(Array(2)).map(async () => {
        try {
            const transaction = await sskts.service.transaction.placeOrderInProgress.start({
                // tslint:disable-next-line:no-magic-numbers
                expires: moment().add(30, 'minutes').toDate(),
                agentId: 'agentId',
                sellerId: '59d20831e53ebc2b4e774466',
                clientUser: {},
                passportToken: passportToken
            })(new sskts.repository.Organization(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
            console.log('transaction started.', transaction.id);
        } catch (error) {
            console.error(error);
        }
    }))
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
}).then(() => {
    sskts.mongoose.disconnect();
});