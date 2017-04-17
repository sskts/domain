/**
 * COA仮予約ファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as SeatReservationAssetFactory from '../../../lib/factory/asset/seatReservation';
import * as CoaSeatReservationAuthorizationFactory from '../../../lib/factory/authorization/coaSeatReservation';
import * as OwnershipFactory from '../../../lib/factory/ownership';

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
                sale_price: 123,
                mvtk_app_price: 0,
                add_glasses: 0,
                kbn_eisyahousiki: '00'
            })
        ];

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
                sale_price: 123,
                mvtk_app_price: 0,
                add_glasses: 0,
                kbn_eisyahousiki: '00'
            })
        ];

        assert.throws(
            () => {
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
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'owner_from');
                return true;
            }
        );
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
                sale_price: 123,
                mvtk_app_price: 0,
                add_glasses: 0,
                kbn_eisyahousiki: '00'
            })
        ];

        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create({
                    price: 123,
                    owner_from: 'xxx',
                    owner_to: 'xxx',
                    coa_tmp_reserve_num: <any>'123',
                    coa_theater_code: 'xxx',
                    coa_date_jouei: 'xxx',
                    coa_title_code: 'xxx',
                    coa_title_branch_num: 'xxx',
                    coa_time_begin: 'xxx',
                    coa_screen_code: 'xxx',
                    assets: assets
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_tmp_reserve_num');
                return true;
            }
        );
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
                sale_price: 123,
                mvtk_app_price: 0,
                add_glasses: 0,
                kbn_eisyahousiki: '00'
            })
        ];

        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create({
                    price: <any>'123',
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
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'price');
                return true;
            }
        );
    });

    it('価格が0以下なので作成できない', () => {
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
                sale_price: 123,
                mvtk_app_price: 0,
                add_glasses: 0,
                kbn_eisyahousiki: '00'
            })
        ];

        assert.throws(
            () => {
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
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'price');
                return true;
            }
        );
    });
});
