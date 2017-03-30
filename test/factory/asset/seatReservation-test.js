"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 座席予約資産ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const SeatReservationAssetFactory = require("../../../lib/factory/asset/seatReservation");
const OwnershipFactory = require("../../../lib/factory/ownership");
describe('座席予約資産ファクトリー', () => {
    it('作成できる', () => {
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
        });
    });
    it('パフォーマンス空なので作成できない', () => {
        assert.throws(() => {
            SeatReservationAssetFactory.create({
                ownership: OwnershipFactory.create({
                    owner: 'xxx',
                    authenticated: false
                }),
                performance: '',
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
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'performance');
            return true;
        });
    });
    it('座席コード空なので作成できない', () => {
        assert.throws(() => {
            SeatReservationAssetFactory.create({
                ownership: OwnershipFactory.create({
                    owner: 'xxx',
                    authenticated: false
                }),
                performance: 'xxx',
                section: 'xxx',
                seat_code: '',
                ticket_code: 'xxx',
                ticket_name_ja: 'xxx',
                ticket_name_en: 'xxx',
                ticket_name_kana: 'xxx',
                std_price: 123,
                add_price: 123,
                dis_price: 123,
                sale_price: 123
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'seat_code');
            return true;
        });
    });
    it('標準単価が数字でないので作成できない', () => {
        assert.throws(() => {
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
                std_price: '123',
                add_price: 123,
                dis_price: 123,
                sale_price: 123
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'std_price');
            return true;
        });
    });
    it('加算単価が数字でないので作成できない', () => {
        assert.throws(() => {
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
                add_price: '123',
                dis_price: 123,
                sale_price: 123
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'add_price');
            return true;
        });
    });
    it('割引額が数字でないので作成できない', () => {
        assert.throws(() => {
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
                dis_price: '123',
                sale_price: 123
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'dis_price');
            return true;
        });
    });
    it('販売単価が数字でないので作成できない', () => {
        assert.throws(() => {
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
                sale_price: '123'
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'sale_price');
            return true;
        });
    });
});
