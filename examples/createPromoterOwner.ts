/**
 * 興行所有者作成
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

const debug = createDebug('sskts-api:*');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

async function main() {
    const ownerAdapter = sskts.createOwnerAdapter(mongoose.connection);

    const owner = sskts.factory.owner.createPromoter({
        name: {
            ja: '佐々木興業株式会社',
            en: 'Cinema Sunshine Co., Ltd.'
        },
    });
    await ownerAdapter.store(owner);

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
