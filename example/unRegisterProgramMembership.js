/**
 * 会員プログラム登録解除サンプル
 * @ignore
 */
const moment = require('moment');
const sskts = require('../');

async function main() {
    let redisClient;
    try {
        await sskts.mongoose.connect(process.env.MONGOLAB_URI);

        const personId = 'aebaf573-98c1-4cea-84bf-e20ebdc6869a';
        const membershipNumber = 'ilovegadd';
        const programMembershipId = '5afff104d51e59232c7b481b';
        const ownershipInfo = {
            typeOf: 'OwnershipInfo',
            identifier: 'ProgramMembership-MO118-180531-000008-0',
            typeOfGood: { id: '5afff104d51e59232c7b481b' },
            ownedBy: {
                memberOf: {
                    typeOf: 'ProgramMembership',
                    membershipNumber: membershipNumber
                }
            }
        };

        await sskts.service.programMembership.unRegister({
            typeOf: sskts.factory.actionType.UnRegisterAction,
            agent: {
                typeOf: sskts.factory.personType.Person,
                id: personId,
                memberOf: {
                    typeOf: 'ProgramMembership',
                    membershipNumber: membershipNumber
                }
            },
            object: ownershipInfo
            // potentialActions?: any;
        })({
            action: new sskts.repository.Action(sskts.mongoose.connection),
            ownershipInfo: new sskts.repository.OwnershipInfo(sskts.mongoose.connection),
            task: new sskts.repository.Task(sskts.mongoose.connection)
        });
        console.log('unRegistered.');
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
