/**
 * 企業作成サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

const debug = createDebug('sskts-domain:examples');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

async function main() {
    const organizationAdapter = sskts.adapter.organization(mongoose.connection);

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
    await organizationAdapter.organizationModel.findOneAndUpdate(
        {
            identifier: corporation.identifier,
            typeOf: sskts.factory.organizationType.Corporation
        },
        corporation,
        { upsert: true }
    ).exec();

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
