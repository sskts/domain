/**
 * 会員プログラム登録サンプル
 */
const sskts = require('../');

const AWS = sskts.AWS;

async function main() {
    let redisClient;
    try {
        await sskts.mongoose.connect(process.env.MONGOLAB_URI);
        redisClient = sskts.redis.createClient({
            host: process.env.TEST_REDIS_HOST,
            port: parseInt(process.env.TEST_REDIS_PORT, 10),
            password: process.env.TEST_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });

        const personId = 'aebaf573-98c1-4cea-84bf-e20ebdc6869a';
        const membershipNumber = 'ilovegadd';
        const sellerId = '59d20831e53ebc2b4e774466';
        const programMembershipId = '5afff104d51e59232c7b481b';

        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
            apiVersion: 'latest',
            region: 'ap-northeast-1',
            credentials: new AWS.Credentials({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            })
        });

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);

        const seller = await organizationRepo.findById(sskts.factory.organizationType.MovieTheater, sellerId);
        const programMemberships = await programMembershipRepo.search({ id: programMembershipId });
        let programMembership = programMemberships.shift();
        programMembership.hostingOrganization = seller;
        const acceptedOffer = {
            typeOf: 'Offer',
            identifier: programMembership.offers[0].identifier,
            price: programMembership.offers[0].price,
            priceCurrency: programMembership.offers[0].priceCurrency,
            itemOffered: programMembership,
            eligibleDuration: programMembership.offers[0].eligibleDuration
        };

        await sskts.service.programMembership.register({
            typeOf: sskts.factory.actionType.RegisterAction,
            agent: {
                typeOf: sskts.factory.personType.Person,
                id: personId,
                memberOf: {
                    typeOf: 'ProgramMembership',
                    membershipNumber: membershipNumber
                }
            },
            object: acceptedOffer
            // potentialActions?: any;
        })({
            action: new sskts.repository.Action(sskts.mongoose.connection),
            orderNumber: new sskts.repository.OrderNumber(redisClient),
            organization: organizationRepo,
            ownershipInfo: new sskts.repository.OwnershipInfo(sskts.mongoose.connection),
            person: new sskts.repository.Person(cognitoIdentityServiceProvider),
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient),
            transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
        });
        console.log('registered.');
    } catch (error) {
        console.error(error);
    }

    redisClient.quit();
    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
