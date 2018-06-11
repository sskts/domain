/**
 * 劇場ショップオープンサンプル
 */

const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);
    const redisClient = sskts.redis.createClient({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_KEY,
        tls: { servername: process.env.REDIS_HOST }
    });

    const accountNumberRepo = new sskts.repository.AccountNumber(redisClient);
    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
    const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials({
        domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
        clientId: process.env.PECORINO_API_CLIENT_ID,
        clientSecret: process.env.PECORINO_API_CLIENT_SECRET,
        scopes: [],
        state: ''
    });
    const acconutService = new sskts.pecorinoapi.service.Account({
        endpoint: process.env.PECORINO_API_ENDPOINT,
        auth: pecorinoAuthClient
    });

    // Pecorino口座開設
    const account = await sskts.service.account.open({ name: 'シネマサンシャインユーカリが丘テスト' })({
        accountNumber: accountNumberRepo,
        accountService: acconutService
    });
    console.log('account opened.', account.accountNumber);

    const movieTheaters = [
        {
            typeOf: sskts.factory.organizationType.MovieTheater,
            identifier: 'MovieTheater-119',
            name: {
                en: 'CinemasunshineTest119',
                ja: 'シネマサンシャインユーカリが丘テスト'
            },
            legalName: {
                en: '',
                ja: ''
            },
            branchCode: '119',
            gmoInfo: {
                shopPass: 'xbxmkaa6',
                shopId: 'tshop00026096',
                siteId: 'tsite00022126'
            },
            paymentAccepted: [
                {
                    paymentMethodType: sskts.factory.paymentMethodType.Pecorino,
                    accountNumber: account.accountNumber
                }
            ],
            parentOrganization: {
                typeOf: sskts.factory.organizationType.Corporation,
                identifier: sskts.factory.organizationIdentifier.corporation.SasakiKogyo,
                name: {
                    en: 'Cinema Sunshine Co., Ltd.',
                    ja: '佐々木興業株式会社'
                }
            },
            location: {
                typeOf: sskts.factory.placeType.MovieTheater,
                branchCode: '119',
                name: {
                    en: 'CinemasunshineTest119',
                    ja: 'シネマサンシャインユーカリが丘テスト'
                }
            },
            url: 'http://devssktsportal.azurewebsites.net/theater/yukarigaoka/',
            telephone: '0312345678'
        }
    ];

    await Promise.all(movieTheaters.map(async (movieTheater) => {
        await organizationRepo.openMovieTheaterShop(movieTheater);
    }));

    redisClient.quit();
    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
