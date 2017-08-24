/**
 * 劇場組織検索サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import * as sskts from '../lib/index';

const debug = createDebug('sskts-domain:examples');

async function main() {
    (<any>mongoose).Promise = global.Promise;
    mongoose.connect(process.env.MONGOLAB_URI);

    const theaters = await sskts.service.organization.searchMovieTheaters({})(sskts.adapter.organization(mongoose.connection));
    debug('theaters are', theaters);

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
