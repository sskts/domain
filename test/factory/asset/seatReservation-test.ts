/**
 * 座席予約資産ファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as SeatReservationAssetFactory from '../../../lib/factory/asset/seatReservation';
import * as OwnershipFactory from '../../../lib/factory/ownership';

let validCreateSeatReservationAssetArgs: any;
before(() => {
    validCreateSeatReservationAssetArgs = {
        ownership: OwnershipFactory.create({
            owner: 'xxx',
            authenticated: false
        }),
        performance: 'xxx',
        section: 'xxx',
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

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'performance');

                return true;
            }
        );
    });

    it('座席コード空なので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.seat_code = '';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'seat_code');

                return true;
            }
        );
    });

    it('標準単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.std_price = '123';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'std_price');

                return true;
            }
        );
    });

    it('加算単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.add_price = '123';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'add_price');

                return true;
            }
        );
    });

    it('割引額が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.dis_price = '123';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'dis_price');

                return true;
            }
        );
    });

    it('販売単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.sale_price = '123';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'sale_price');

                return true;
            }
        );
    });

    it('ムビチケ計上単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.mvtk_app_price = '123';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'mvtk_app_price');

                return true;
            }
        );
    });

    it('メガネ単価が数字でないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.add_glasses = '123';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'add_glasses');

                return true;
            }
        );
    });

    it('ムビチケ映写方式区分が空なので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.kbn_eisyahousiki = '';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'kbn_eisyahousiki');

                return true;
            }
        );
    });

    it('セクションがstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.section = null;

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'section');

                return true;
            }
        );
    });

    it('券種名(カナ)がstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.ticket_name_kana = null;

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'ticket_name_kana');

                return true;
            }
        );
    });

    it('ムビチケ購入管理番号がstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.mvtk_num = null;

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'mvtk_num');

                return true;
            }
        );
    });

    it('券種名(ja)が空なので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.ticket_name.ja = '';

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'ticket_name.ja');

                return true;
            }
        );
    });

    it('券種名(en)がstringでないので作成できない', () => {
        const args = Object.assign({}, validCreateSeatReservationAssetArgs);
        args.ticket_name.en = null;

        assert.throws(
            () => {
                SeatReservationAssetFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'ticket_name.en');

                return true;
            }
        );
    });
});
