"use strict";
/**
 * COA仮予約ファクトリーテスト
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
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const assetGroup_1 = require("../../../lib/factory/assetGroup");
const CoaSeatReservationAuthorizationFactory = require("../../../lib/factory/authorization/coaSeatReservation");
const OwnershipFactory = require("../../../lib/factory/ownership");
let validAsset;
before(() => __awaiter(this, void 0, void 0, function* () {
    validAsset = {
        id: 'xxx',
        group: assetGroup_1.default.SEAT_RESERVATION,
        price: 123,
        authorizations: [],
        ownership: OwnershipFactory.create({
            owner: 'xxx'
        }),
        performance: 'xxx',
        screen_section: 'xxx',
        seat_code: 'xxx',
        ticket_code: 'xxx',
        ticket_name: {
            en: 'xxx',
            ja: 'xxx'
        },
        ticket_name_kana: 'xxx',
        std_price: 123,
        add_price: 123,
        dis_price: 123,
        sale_price: 123,
        mvtk_app_price: 0,
        add_glasses: 0,
        kbn_eisyahousiki: '00',
        mvtk_num: '',
        mvtk_kbn_denshiken: '00',
        mvtk_kbn_maeuriken: '00',
        mvtk_kbn_kensyu: '00',
        mvtk_sales_price: 0
    };
}));
describe('COA仮予約ファクトリー', () => {
    it('作成できる', () => {
        const assets = [validAsset];
        assert.doesNotThrow(() => {
            CoaSeatReservationAuthorizationFactory.create({
                price: 123,
                owner_from: 'xxx',
                owner_to: 'xxx',
                coa_tmp_reserve_num: 123,
                coa_theater_code: 'xxx',
                coa_date_jouei: 'xxx',
                coa_title_code: 'xxx',
                coa_title_branch_num: 'xxx',
                coa_time_begin: 'xxx',
                coa_screen_code: 'xxx',
                assets: assets
            });
        });
    });
    it('from所有者が空なので作成できない', () => {
        const assets = [validAsset];
        assert.throws(() => {
            CoaSeatReservationAuthorizationFactory.create({
                price: 123,
                owner_from: '',
                owner_to: 'xxx',
                coa_tmp_reserve_num: 123,
                coa_theater_code: 'xxx',
                coa_date_jouei: 'xxx',
                coa_title_code: 'xxx',
                coa_title_branch_num: 'xxx',
                coa_time_begin: 'xxx',
                coa_screen_code: 'xxx',
                assets: assets
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'owner_from');
            return true;
        });
    });
    it('仮予約番号が数字でないので作成できない', () => {
        const assets = [validAsset];
        assert.throws(() => {
            CoaSeatReservationAuthorizationFactory.create({
                price: 123,
                owner_from: 'xxx',
                owner_to: 'xxx',
                coa_tmp_reserve_num: '123',
                coa_theater_code: 'xxx',
                coa_date_jouei: 'xxx',
                coa_title_code: 'xxx',
                coa_title_branch_num: 'xxx',
                coa_time_begin: 'xxx',
                coa_screen_code: 'xxx',
                assets: assets
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'coa_tmp_reserve_num');
            return true;
        });
    });
    it('価格が数字でないので作成できない', () => {
        const assets = [validAsset];
        assert.throws(() => {
            CoaSeatReservationAuthorizationFactory.create({
                price: '123',
                owner_from: 'xxx',
                owner_to: 'xxx',
                coa_tmp_reserve_num: 123,
                coa_theater_code: 'xxx',
                coa_date_jouei: 'xxx',
                coa_title_code: 'xxx',
                coa_title_branch_num: 'xxx',
                coa_time_begin: 'xxx',
                coa_screen_code: 'xxx',
                assets: assets
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'price');
            return true;
        });
    });
    it('価格が0以下なので作成できない', () => {
        const assets = [validAsset];
        assert.throws(() => {
            CoaSeatReservationAuthorizationFactory.create({
                price: 0,
                owner_from: 'xxx',
                owner_to: 'xxx',
                coa_tmp_reserve_num: 123,
                coa_theater_code: 'xxx',
                coa_date_jouei: 'xxx',
                coa_title_code: 'xxx',
                coa_title_branch_num: 'xxx',
                coa_time_begin: 'xxx',
                coa_screen_code: 'xxx',
                assets: assets
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'price');
            return true;
        });
    });
});
