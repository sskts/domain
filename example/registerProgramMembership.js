/**
 * 会員プログラム登録サンプル
 * @ignore
 */
const moment = require('moment');
const sskts = require('../');

async function main() {
    try {
        await sskts.mongoose.connect(process.env.MONGOLAB_URI);

        const personId = 'aebaf573-98c1-4cea-84bf-e20ebdc6869a';
        const sellerId = '59d20831e53ebc2b4e774466';
        const programMembershipId = '5afff104d51e59232c7b481b';

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

        const registerAction = await sskts.service.programMembership.register({
            typeOf: sskts.factory.actionType.RegisterAction,
            agent: {
                typeOf: sskts.factory.personType.Person,
                id: personId
            },
            object: acceptedOffer
            // potentialActions?: any;
        })({
            action: new sskts.repository.Action(sskts.mongoose.connection),
            organization: organizationRepo,
            programMembership: programMembershipRepo,
            transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
        });
        console.log('registered.', registerAction);
    } catch (error) {
        console.error(error);
    }

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
