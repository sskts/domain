/**
 * COA仮予約ファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';

import AssetGroup from '../../../lib/factory/assetGroup';
import * as CoaSeatReservationAuthorizationFactory from '../../../lib/factory/authorization/coaSeatReservation';
import * as OwnershipFactory from '../../../lib/factory/ownership';

let TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS: any;
before(async () => {
    TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS = {
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
        assets: [
            {
                id: 'xxx',
                group: AssetGroup.SEAT_RESERVATION,
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
            }
        ]
    };
});

describe('COA仮予約ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            CoaSeatReservationAuthorizationFactory.create(TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS);
        });
    });

    it('to所有者が空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ owner_to: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'owner_to');

                return true;
            }
        );
    });

    it('from所有者が空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ owner_from: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'owner_from');

                return true;
            }
        );
    });

    it('COA劇場コードが空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ coa_theater_code: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_theater_code');

                return true;
            }
        );
    });

    it('COA上映日が空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ coa_date_jouei: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_date_jouei');

                return true;
            }
        );
    });

    it('COAタイトルコードが空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ coa_title_code: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_title_code');

                return true;
            }
        );
    });

    it('COAタイトル枝番号が空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ coa_title_branch_num: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_title_branch_num');

                return true;
            }
        );
    });

    it('COA開始時刻が空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ coa_time_begin: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_time_begin');

                return true;
            }
        );
    });

    it('COAスクリーンコードが空なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ coa_screen_code: '' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_screen_code');

                return true;
            }
        );
    });

    it('仮予約番号が数字でないので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ coa_tmp_reserve_num: '123' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'coa_tmp_reserve_num');

                return true;
            }
        );
    });

    it('価格が数字でないので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ price: '123' } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'price');

                return true;
            }
        );
    });

    it('価格が0以下なので作成できない', () => {
        const args = { ...TEST_CREATE_COA_SEAT_RESERVATION_AUTHORIZATION_ARGS, ...{ price: 0 } };
        assert.throws(
            () => {
                CoaSeatReservationAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'price');

                return true;
            }
        );
    });
});
