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

    const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
    const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

    await sskts.service.sales.payPecorino('5a8d18e7f98e051d74800a50')(
        actionRepo, transactionRepo, authClient
    );
}

main().then(() => {
    console.log('succeess!');
}).catch((err) => {
    console.error(err);
}).then(() => {
    sskts.mongoose.disconnect();
});
