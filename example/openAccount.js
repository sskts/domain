/**
 * 口座開設サンプル
 * @ignore
 */
const moment = require('moment');
const readline = require('readline');
const sskts = require('../');

async function main() {
    let redisClient;
    try {
        redisClient = sskts.redis.createClient({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT, 10),
            password: process.env.REDIS_KEY,
            tls: { servername: process.env.REDIS_HOST }
        });

        const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials({
            domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
            clientId: process.env.PECORINO_API_CLIENT_ID,
            clientSecret: process.env.PECORINO_API_CLIENT_SECRET,
            scopes: [],
            state: ''
        });
        const accountService = new sskts.pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: pecorinoAuthClient
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const accountName = await new Promise((resolve) => {
            rl.question('口座名義を入力してください。:\n', async (accountName) => {
                rl.close();
                resolve(accountName);
            });
        });

        const account = await sskts.service.account.open({
            name: accountName
        })({
            accountNumber: new sskts.repository.AccountNumber(redisClient),
            accountService: accountService
        });
        console.log('account opened.', account.accountNumber);
    } catch (error) {
        console.error(error);
    }

    redisClient.quit();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
