/**
 * 会員プログラム登録サンプル
 * @ignore
 */
const moment = require('moment');
const sskts = require('../');

async function main() {
    try {
        await sskts.mongoose.connect(process.env.MONGOLAB_URI);

        const registerAction = await sskts.service.programMembership.register({
            typeOf: sskts.factory.actionType.RegisterAction,
            agent: {
                typeOf: 'Person',
                id: 'aebaf573-98c1-4cea-84bf-e20ebdc6869a'
            },
            object: {
                typeOf: 'ProgramMembershipType',
                programMembershipId: '5afff104d51e59232c7b481b',
                offerIdentifier: 'AnnualPlan',
                sellerId: '59d20831e53ebc2b4e774466'
            }
            // potentialActions?: any;
        })({
            action: new sskts.repository.Action(sskts.mongoose.connection),
            organization: new sskts.repository.Organization(sskts.mongoose.connection),
            programMembership: new sskts.repository.ProgramMembership(sskts.mongoose.connection),
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
