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
const TransactionInquiryKeyFactory = require("../../../lib/factory/transactionInquiryKey");
// 座席予約資産作成の有効な有効なパラメータをテストデータとして用意
let validCreateSeatReservationAssetArgs;
before(() => {
    validCreateSeatReservationAssetArgs = {
        ownership: OwnershipFactory.create({
            owner: 'xxx'
        }),
        performance: 'xxx',
        performance_day: 'xxx',
        performance_time_start: 'xxx',
        performance_time_end: 'xxx',
        theater: 'xxx',
        theater_name: {
            en: 'xxx',
            ja: 'xxx'
        },
        theater_name_kana: 'xxx',
        theater_address: 'xxx',
        screen: 'xxx',
        screen_name: {
            en: 'xxx',
            ja: 'xxx'
        },
        screen_section: 'xxx',
        seat_code: 'xxx',
        film: 'xxx',
        film_name: {
            en: 'xxx',
            ja: 'xxx'
        },
        film_name_kana: 'xxx',
        film_name_short: 'xxx',
        film_name_original: 'xxx',
        film_minutes: 'xxx',
        film_kbn_eirin: 'xxx',
        film_kbn_eizou: 'xxx',
        film_kbn_joueihousiki: 'xxx',
        film_kbn_jimakufukikae: 'xxx',
        film_copyright: 'xxx',
        transaction_inquiry_key: TransactionInquiryKeyFactory.create({
            theater_code: 'xxx',
            reserve_num: 123,
            tel: '09012345678'
        }),
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
});
describe('座席予約資産ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            SeatReservationAssetFactory.create(validCreateSeatReservationAssetArgs);
        });
    });
    it('パフォーマンス空なので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.performance = '';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'performance');
            return true;
        });
    });
    it('座席コード空なので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.seat_code = '';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'seat_code');
            return true;
        });
    });
    it('標準単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.std_price = '123';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'std_price');
            return true;
        });
    });
    it('加算単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.add_price = '123';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'add_price');
            return true;
        });
    });
    it('割引額が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.dis_price = '123';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'dis_price');
            return true;
        });
    });
    it('販売単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.sale_price = '123';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'sale_price');
            return true;
        });
    });
    it('ムビチケ計上単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.mvtk_app_price = '123';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'mvtk_app_price');
            return true;
        });
    });
    it('メガネ単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.add_glasses = '123';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'add_glasses');
            return true;
        });
    });
    it('ムビチケ映写方式区分が空なので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.kbn_eisyahousiki = '';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'kbn_eisyahousiki');
            return true;
        });
    });
    it('セクションがstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.screen_section = null;
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'screen_section');
            return true;
        });
    });
    it('券種名(カナ)がstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.ticket_name_kana = null;
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'ticket_name_kana');
            return true;
        });
    });
    it('ムビチケ購入管理番号がstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.mvtk_num = null;
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'mvtk_num');
            return true;
        });
    });
    it('券種名(ja)が空なので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.ticket_name.ja = '';
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'ticket_name.ja');
            return true;
        });
    });
    it('券種名(en)がstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.ticket_name.en = null;
        assert.throws(() => {
            SeatReservationAssetFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'ticket_name.en');
            return true;
        });
    });
});
