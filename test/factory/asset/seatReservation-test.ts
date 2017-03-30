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
        assert.throws(
            () => {
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

            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'performance');
                return true;
            }
        );
    });

    it('座席コード空なので作成できない', () => {
        assert.throws(
            () => {
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

            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'seat_code');
                return true;
            }
        );
    });

    it('標準単価が数字でないので作成できない', () => {
        assert.throws(
            () => {
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
                    std_price: <any>'123',
                    add_price: 123,
                    dis_price: 123,
                    sale_price: 123
                });

            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'std_price');
                return true;
            }
        );
    });

    it('加算単価が数字でないので作成できない', () => {
        assert.throws(
            () => {
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
                    add_price: <any>'123',
                    dis_price: 123,
                    sale_price: 123
                });

            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'add_price');
                return true;
            }
        );
    });

    it('割引額が数字でないので作成できない', () => {
        assert.throws(
            () => {
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
                    dis_price: <any>'123',
                    sale_price: 123
                });

            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'dis_price');
                return true;
            }
        );
    });

    it('販売単価が数字でないので作成できない', () => {
        assert.throws(
            () => {
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
                    sale_price: <any>'123'
                });

            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'sale_price');
                return true;
            }
        );
    });
});
