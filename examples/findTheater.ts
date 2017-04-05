/**
 * 劇場取得の例
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';
import * as util from 'util';

import * as sskts from '../lib/index';
import connectionOptions from './connectionOptions';

const debug = createDebug('sskts-domain:example:findTheater');

async function main() {
    (<any>mongoose).Promise = global.Promise;
    mongoose.connect(process.env.MONGOLAB_URI, connectionOptions);

    const theaterOption = await sskts.service.master.findTheater('118')(sskts.adapter.theater(mongoose.connection));
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
