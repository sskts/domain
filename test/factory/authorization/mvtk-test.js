"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ムビチケ着券情報ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const MvtkAuthorizationFactory = require("../../../lib/factory/authorization/mvtk");
let TEST_KNSH_INFO;
let TEST_KNYKNR_NO_INFO;
let TEST_ZSK_INFO;
let TEST_CREATE_MVTK_AUTHORIZATION_ARGS;
before(() => __awaiter(this, void 0, void 0, function* () {
    TEST_KNSH_INFO = {
        knsh_typ: '01',
        mi_num: '1'
    };
    TEST_KNYKNR_NO_INFO = {
        knyknr_no: '0000000000',
        pin_cd: '0000',
        knsh_info: [TEST_KNSH_INFO]
    };
    TEST_ZSK_INFO = {
        zsk_cd: 'Ａ－２'
    };
    TEST_CREATE_MVTK_AUTHORIZATION_ARGS = {
        price: 1234,
        owner_from: 'xxx',
        owner_to: 'xxx',
        kgygish_cd: '000000',
        yyk_dvc_typ: '00',
        trksh_flg: '0',
        kgygish_sstm_zskyyk_no: 'xxx',
        kgygish_usr_zskyyk_no: 'xxx',
        jei_dt: '2012/02/01 25:45:00',
        kij_ymd: '2012/02/01',
        st_cd: '0000000000',
        scren_cd: '0000000000',
        knyknr_no_info: [TEST_KNYKNR_NO_INFO],
        zsk_info: [TEST_ZSK_INFO],
        skhn_cd: '0000000000'
    };
}));
describe('ムビチケ着券情報ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            MvtkAuthorizationFactory.create(TEST_CREATE_MVTK_AUTHORIZATION_ARGS);
        });
    });
    it('興行会社コードが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { kgygish_cd: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'kgygish_cd');
            return true;
        });
    });
    it('予約デバイス区分が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { yyk_dvc_typ: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'yyk_dvc_typ');
            return true;
        });
    });
    it('取消しフラグが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { trksh_flg: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'trksh_flg');
            return true;
        });
    });
    it('興行会社システム座席予約番号が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { kgygish_sstm_zskyyk_no: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'kgygish_sstm_zskyyk_no');
            return true;
        });
    });
    it('興行会社ユーザー座席予約番号が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { kgygish_usr_zskyyk_no: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'kgygish_usr_zskyyk_no');
            return true;
        });
    });
    it('上映日が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { jei_dt: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'jei_dt');
            return true;
        });
    });
    it('開示日が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { kij_ymd: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'kij_ymd');
            return true;
        });
    });
    it('サイトコードが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { st_cd: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'st_cd');
            return true;
        });
    });
    it('スクリーンコードが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { scren_cd: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'scren_cd');
            return true;
        });
    });
    it('作品コードが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { skhn_cd: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'skhn_cd');
            return true;
        });
    });
    it('所有者fromが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { owner_from: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'owner_from');
            return true;
        });
    });
    it('所有者toが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { owner_to: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'owner_to');
            return true;
        });
    });
    it('購入管理番号情報が配列でないので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info');
            return true;
        });
    });
    it('購入管理番号情報が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: [] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info');
            return true;
        });
    });
    it('購入管理番号情報の鑑賞タイプが空なので作成できない', () => {
        const knyknrNoInfo = Object.assign({}, TEST_KNYKNR_NO_INFO, { knyknr_no: '' });
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: [knyknrNoInfo] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info.knyknr_no');
            return true;
        });
    });
    it('購入管理番号情報のピンコードが空なので作成できない', () => {
        const knyknrNoInfo = Object.assign({}, TEST_KNYKNR_NO_INFO, { pin_cd: '' });
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: [knyknrNoInfo] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info.pin_cd');
            return true;
        });
    });
    it('購入管理番号情報の鑑賞情報が配列でないので作成できない', () => {
        const knyknrNoInfo = Object.assign({}, TEST_KNYKNR_NO_INFO, { knsh_info: '' });
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: [knyknrNoInfo] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info.knsh_info');
            return true;
        });
    });
    it('購入管理番号情報の鑑賞情報が空なので作成できない', () => {
        const knyknrNoInfo = Object.assign({}, TEST_KNYKNR_NO_INFO, { knsh_info: [] });
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: [knyknrNoInfo] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info.knsh_info');
            return true;
        });
    });
    it('購入管理番号情報の鑑賞情報の鑑賞タイプが空なので作成できない', () => {
        const knshInfo = Object.assign({}, TEST_KNSH_INFO, { knsh_typ: '' });
        const knyknrNoInfo = Object.assign({}, TEST_KNYKNR_NO_INFO, { knsh_info: [knshInfo] });
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: [knyknrNoInfo] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info.knsh_info.knsh_typ');
            return true;
        });
    });
    it('購入管理番号情報の鑑賞情報の枚数が空なので作成できない', () => {
        const knshInfo = Object.assign({}, TEST_KNSH_INFO, { mi_num: '' });
        const knyknrNoInfo = Object.assign({}, TEST_KNYKNR_NO_INFO, { knsh_info: [knshInfo] });
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { knyknr_no_info: [knyknrNoInfo] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'knyknr_no_info.knsh_info.mi_num');
            return true;
        });
    });
    it('座席情報が配列でないので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { zsk_info: '' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'zsk_info');
            return true;
        });
    });
    it('座席情報が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { zsk_info: [] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'zsk_info');
            return true;
        });
    });
    it('座席情報の座席コードが空なので作成できない', () => {
        const zskInfo = Object.assign({}, TEST_ZSK_INFO, { zsk_cd: '' });
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { zsk_info: [zskInfo] });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'zsk_info.zsk_cd');
            return true;
        });
    });
    it('価格が数字でないので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { price: '123' });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'price');
            return true;
        });
    });
    it('価格が0以下なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MVTK_AUTHORIZATION_ARGS, { price: 0 });
        assert.throws(() => {
            MvtkAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'price');
            return true;
        });
    });
});
