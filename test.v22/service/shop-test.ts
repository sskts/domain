/**
 * ショップサービステスト
 *
 * @ignore
 */

import * as COA from '@motionpicture/coa-service';
import * as assert from 'assert';
import * as mongoose from 'mongoose';

import TheaterAdapter from '../../lib/adapter/theater';

import * as TheaterFactory from '../../lib/factory/theater';
import TheaterWebsiteGroup from '../../lib/factory/theaterWebsiteGroup';

import * as ShopService from '../../lib/service/shop';

const TEST_THEATER_CODE = '118';
// tslint:disable-next-line:no-http-string
const TEST_THEATER_PORTAL_URL = 'http://example.com';
let connection: mongoose.Connection;

before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

after(async () => {
    // テスト会員削除
});

describe('ショップサービス 開店', () => {
    it('開店できる', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        // 劇場を削除してから
        await theaterAdapter.model.findByIdAndRemove(TEST_THEATER_CODE).exec();

        const requiredFields = await COA.services.master.theater({
            theater_code: TEST_THEATER_CODE
        })
            .then(TheaterFactory.createFromCOA);

        const theater: TheaterFactory.ITheater = {
            ...requiredFields,
            ...{
                address: {
                    en: '',
                    ja: ''
                },
                websites: [
                    TheaterFactory.createWebsite({
                        group: TheaterWebsiteGroup.PORTAL,
                        name: {
                            en: 'xxx',
                            ja: 'xxx'
                        },
                        url: TEST_THEATER_PORTAL_URL
                    })
                ],
                gmo: {
                    site_id: 'tsite00022126',
                    shop_id: 'tshop00026096',
                    shop_pass: 'xbxmkaa6'
                }
            }
        };

        await ShopService.open(theater)(theaterAdapter);

        // 劇場データ存在確認
        const theaterDoc = <mongoose.Document>await theaterAdapter.model.findById(TEST_THEATER_CODE).exec();
        assert.notEqual(theaterDoc, null);
        assert.equal(theaterDoc.get('id'), TEST_THEATER_CODE);
    });
});
