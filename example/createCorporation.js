/**
 * 企業作成サンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

    const corporation = sskts.factory.organization.corporation.create({
        identifier: sskts.factory.organizationIdentifier.corporation.SasakiKogyo,
        name: {
            ja: '佐々木興業株式会社',
            en: 'Cinema Sunshine Co., Ltd.'
        },
        legalName: {
            ja: '佐々木興業株式会社',
            en: 'Cinema Sunshine Co., Ltd.'
        }
    });
    await organizationRepo.organizationModel.findOneAndUpdate(
        {
            identifier: corporation.identifier,
            typeOf: sskts.factory.organizationType.Corporation
        },
        corporation,
        { upsert: true }
    ).exec();

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
