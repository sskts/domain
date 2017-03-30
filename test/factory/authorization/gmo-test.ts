/**
 * GMOオーソリファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as GmoAuthorizationFactory from '../../../lib/factory/authorization/gmo';

describe('GMOオーソリファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            GmoAuthorizationFactory.create({
                price: 123,
                owner_from: 'xxx',
                owner_to: 'xxx',
                gmo_shop_id: 'xxx',
                gmo_shop_pass: 'xxx',
                gmo_order_id: 'xxx',
                gmo_amount: 123,
                gmo_access_id: 'xxx',
                gmo_access_pass: 'xxx',
                gmo_job_cd: 'xxx',
                gmo_pay_type: 'xxx'
            });
        });
    });

    it('ショップIDが空なので作成できない', () => {
        assert.throws(
            () => {
                GmoAuthorizationFactory.create({
                    price: 123,
                    owner_from: 'xxx',
                    owner_to: 'xxx',
                    gmo_shop_id: '',
                    gmo_shop_pass: 'xxx',
                    gmo_order_id: 'xxx',
                    gmo_amount: 123,
                    gmo_access_id: 'xxx',
                    gmo_access_pass: 'xxx',
                    gmo_job_cd: 'xxx',
                    gmo_pay_type: 'xxx'
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'gmo_shop_id');
                return true;
            }
        );
    });

    it('GMO金額が数字でないので作成できない', () => {
        assert.throws(
            () => {
                GmoAuthorizationFactory.create({
                    price: 123,
                    owner_from: 'xxx',
                    owner_to: 'xxx',
                    gmo_shop_id: 'xxx',
                    gmo_shop_pass: 'xxx',
                    gmo_order_id: 'xxx',
                    gmo_amount: <any>'123',
                    gmo_access_id: 'xxx',
                    gmo_access_pass: 'xxx',
                    gmo_job_cd: 'xxx',
                    gmo_pay_type: 'xxx'
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'gmo_amount');
                return true;
            }
        );
    });
});
