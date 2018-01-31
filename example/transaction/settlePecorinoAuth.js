/**
 * Pecorino支払取引実行
 * @ignore
 */

const moment = require('moment');
const request = require('request-promise-native');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

async function main() {
    const authClient = new sskts.pecorinoapi.auth.ClientCredentials({
        domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
        clientId: process.env.PECORINO_CLIENT_ID,
        clientSecret: process.env.PECORINO_CLIENT_SECRET,
        scopes: [
        ]
    });

    const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

    await sskts.service.sales.settlePecorinoAuth('5a71967a1d0999237cc5b82a')(
        transactionRepo, authClient
    );
}

main().then(() => {
    console.log('succeess!');
}).catch((err) => {
    console.error(err);
}).then(() => {
    sskts.mongoose.disconnect();
});
