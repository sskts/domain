/**
 * Pecorino入金取引実行
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

async function main() {
    const authClient = new sskts.pecorinoapi.auth.ClientCredentials({
        domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
        clientId: process.env.PECORINO_CLIENT_ID,
        clientSecret: process.env.PECORINO_CLIENT_SECRET,
        scopes: []
    });
    const depositTransactionService = new sskts.pecorinoapi.service.transaction.Deposit({
        endpoint: process.env.PECORINO_API_ENDPOINT,
        auth: authClient
    });
    const transaction = await depositTransactionService.start({
        toAccountId: 'accountId',
        expires: moment().add(1, 'hour').toISOString(),
        agent: {
            typeOf: 'Person',
            id: 'agentId',
            name: 'テストagent',
            url: 'https://example.com'
        },
        recipient: {
            typeOf: 'Person',
            id: 'recipientId',
            name: 'テストrecipient',
            url: 'https://example.com'
        },
        price: 100,
        notes: 'notes'
    });
    console.log(transaction);

    await depositTransactionService.confirm({ transactionId: transaction.id });
}

main().then(() => {
    console.log('succeess!');
}).catch((err) => {
    console.error(err);
}).then(() => {
    sskts.mongoose.disconnect();
});
