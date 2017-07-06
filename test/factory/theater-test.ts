/**
 * 劇場ファクトリーテスト
 *
 * @ignore
 */

import * as COA from '@motionpicture/coa-service';
import * as assert from 'assert';

import ArgumentNullError from '../../lib/error/argumentNull';

import * as TheaterFactory from '../../lib/factory/theater';
import TheaterWebsiteGroup from '../../lib/factory/theaterWebsiteGroup';

const TEST_THEATER_CODE = '118';
const TEST_CREATE_WEBSITE_ARGS = {
    group: TheaterWebsiteGroup.PORTAL,
    name: {
        en: 'xxx',
        ja: 'xxx'
    },
    // tslint:disable-next-line:no-http-string
    url: 'http://example.com'
};

describe('取引ファクトリー COA情報から必須フィールドを作成する', () => {
    it('作成できる', async () => {
        const theaterFromCOA = await COA.services.master.theater({
            theater_code: TEST_THEATER_CODE
        });
        assert.doesNotThrow(() => {
            TheaterFactory.createFromCOA(theaterFromCOA);
        });
    });
});

describe('取引ファクトリー オプショナルな初期情報を作成する', () => {
    it('作成できる', async () => {
        assert.doesNotThrow(() => {
            TheaterFactory.createInitialOptionalFields();
        });
    });
});

describe('取引ファクトリー ウェブサイト作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TheaterFactory.createWebsite(TEST_CREATE_WEBSITE_ARGS);
        });
    });

    it('グループが空なので作成できない', () => {
        const args = { ...TEST_CREATE_WEBSITE_ARGS, ...{ group: <any>'' } };
        assert.throws(
            () => {
                TheaterFactory.createWebsite(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'group');

                return true;
            }
        );
    });

    it('名称enが空なので作成できない', () => {
        const args = { ...TEST_CREATE_WEBSITE_ARGS, ...{ name: { en: '', ja: 'xxx' } } };
        assert.throws(
            () => {
                TheaterFactory.createWebsite(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'name.en');

                return true;
            }
        );
    });

    it('名称jaが空なので作成できない', () => {
        const args = { ...TEST_CREATE_WEBSITE_ARGS, ...{ name: { en: 'xxx', ja: '' } } };
        assert.throws(
            () => {
                TheaterFactory.createWebsite(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'name.ja');

                return true;
            }
        );
    });

    it('urlが空なので作成できない', () => {
        const args = { ...TEST_CREATE_WEBSITE_ARGS, ...{ url: <any>'' } };
        assert.throws(
            () => {
                TheaterFactory.createWebsite(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'url');

                return true;
            }
        );
    });
});
