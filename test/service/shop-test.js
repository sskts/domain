"use strict";
/**
 * ショップサービステスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const assert = require("assert");
const mongoose = require("mongoose");
const theater_1 = require("../../lib/adapter/theater");
const TheaterFactory = require("../../lib/factory/theater");
const theaterWebsiteGroup_1 = require("../../lib/factory/theaterWebsiteGroup");
const ShopService = require("../../lib/service/shop");
const TEST_THEATER_CODE = '118';
// tslint:disable-next-line:no-http-string
const TEST_THEATER_PORTAL_URL = 'http://example.com';
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
}));
after(() => __awaiter(this, void 0, void 0, function* () {
    // テスト会員削除
}));
describe('ショップサービス 開店', () => {
    it('開店できる', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        // 劇場を削除してから
        yield theaterAdapter.model.findByIdAndRemove(TEST_THEATER_CODE);
        const requiredFields = yield COA.MasterService.theater({
            theater_code: TEST_THEATER_CODE
        })
            .then(TheaterFactory.createFromCOA);
        const theater = Object.assign({}, requiredFields, {
            address: {
                en: '',
                ja: ''
            },
            websites: [
                TheaterFactory.createWebsite({
                    group: theaterWebsiteGroup_1.default.PORTAL,
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
        });
        yield ShopService.open(theater)(theaterAdapter);
        // 劇場データ存在確認
        const theaterDoc = yield theaterAdapter.model.findById(TEST_THEATER_CODE).exec();
        assert.notEqual(theaterDoc, null);
        assert.equal(theaterDoc.get('id'), TEST_THEATER_CODE);
    }));
});
