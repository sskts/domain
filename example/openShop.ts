/**
 * 劇場ショップオープンサンプル
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
    const organizationRepository = sskts.repository.organization(mongoose.connection);

    const movieTheater = sskts.factory.organization.movieTheater.create({
        name: {
            en: 'CinemasunshineTest118',
            ja: 'シネマサンシャイン１１８'
        },
        branchCode: '118',
        gmoInfo: {
            shopPass: 'xbxmkaa6',
            shopId: 'tshop00026096',
            siteId: 'tsite00022126'
        },
        parentOrganization: {
            typeOf: sskts.factory.organizationType.Corporation,
            identifier: sskts.factory.organizationIdentifier.corporation.SasakiKogyo,
            name: {
                en: 'Cinema Sunshine Co., Ltd.',
                ja: '佐々木興業株式会社'
            }
        },
        location: {
            typeOf: 'MovieTheater',
            branchCode: '118',
            name: {
                en: 'CinemasunshineTest118',
                ja: 'シネマサンシャイン１１８'
            }
        },
        telephone: '0312345678',
        // tslint:disable-next-line:no-http-string
        url: 'http://devssktsportal.azurewebsites.net/theater/aira/'
    });

    await organizationRepository.openMovieTheaterShop(movieTheater);

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
