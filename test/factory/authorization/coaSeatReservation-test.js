"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * COA仮予約ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const SeatReservationAssetFactory = require("../../../lib/factory/asset/seatReservation");
const CoaSeatReservationAuthorizationFactory = require("../../../lib/factory/authorization/coaSeatReservation");
const OwnershipFactory = require("../../../lib/factory/ownership");
describe('COA仮予約ファクトリー', () => {
    it('作成できる', () => {
        const assets = [
            SeatReservationAssetFactory.create({
                ownership: OwnershipFactory.create({
                    owner: 'xxx',
                    authenticated: false
                }),
                performance: 'xxx',
                section: 'xxx',
                seat_code: 'xxx',
                ticket_code: 'xxx',
                ticket_name_ja: 'xxx',
                ticket_name_en: 'xxx',
                ticket_name_kana: 'xxx',
                std_price: 123,
                add_price: 123,
                dis_price: 123,
                sale_price: 123
            })
        ];
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
    it('from所有者が空なので作成できない', () => {
        const assets = [
            SeatReservationAssetFactory.create({
                ownership: OwnershipFactory.create({
                    owner: 'xxx',
                    authenticated: false
                }),
                performance: 'xxx',
                section: 'xxx',
                seat_code: 'xxx',
                ticket_code: 'xxx',
                ticket_name_ja: 'xxx',
                ticket_name_en: 'xxx',
                ticket_name_kana: 'xxx',
                std_price: 123,
                add_price: 123,
                dis_price: 123,
                sale_price: 123
            })
        ];
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
        const assets = [
            SeatReservationAssetFactory.create({
                ownership: OwnershipFactory.create({
                    owner: 'xxx',
                    authenticated: false
                }),
                performance: 'xxx',
                section: 'xxx',
                seat_code: 'xxx',
                ticket_code: 'xxx',
                ticket_name_ja: 'xxx',
                ticket_name_en: 'xxx',
                ticket_name_kana: 'xxx',
                std_price: 123,
                add_price: 123,
                dis_price: 123,
                sale_price: 123
            })
        ];
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
        const assets = [
            SeatReservationAssetFactory.create({
                ownership: OwnershipFactory.create({
                    owner: 'xxx',
                    authenticated: false
                }),
                performance: 'xxx',
                section: 'xxx',
                seat_code: 'xxx',
                ticket_code: 'xxx',
                ticket_name_ja: 'xxx',
                ticket_name_en: 'xxx',
                ticket_name_kana: 'xxx',
                std_price: 123,
                add_price: 123,
                dis_price: 123,
                sale_price: 123
            })
        ];
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
});
