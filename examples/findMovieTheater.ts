/**
 * 劇場取得サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';
import * as util from 'util';

import * as sskts from '../lib/index';

const debug = createDebug('sskts-domain:examples');

async function main() {
    (<any>mongoose).Promise = global.Promise;
    mongoose.connect(process.env.MONGOLAB_URI);

    const theaterOption = await sskts.service.place.findMovieTheaterByBranchCode('118')(sskts.adapter.place(mongoose.connection));
    // tslint:disable-next-line:no-magic-numbers
    debug(util.inspect(theaterOption.get(), false, 10));

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
