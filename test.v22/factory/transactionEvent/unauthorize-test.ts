/**
 * 承認取消取引イベントファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as GmoAuthorizationFactory from '../../../lib/factory/authorization/gmo';
import * as UnauthorizeTransactionEventFactory from '../../../lib/factory/transactionEvent/unauthorize';

describe('承認取消取引イベントファクトリー', () => {
    it('作成できる', () => {
        const authorization = GmoAuthorizationFactory.create({
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

        assert.doesNotThrow(() => {
            UnauthorizeTransactionEventFactory.create({
                transaction: 'xxx',
                occurred_at: new Date(),
                authorization: authorization
            });
        });
    });

    it('発生日時が不適切なので作成できない', () => {
        const authorization = GmoAuthorizationFactory.create({
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

        assert.throws(
            () => {
                UnauthorizeTransactionEventFactory.create({
                    transaction: 'xxx',
                    occurred_at: <any>(new Date()).toString(),
                    authorization: authorization
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'occurred_at');

                return true;
            }
        );
    });

    it('取引が空なので作成できない', () => {
        const authorization = GmoAuthorizationFactory.create({
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

        assert.throws(
            () => {
                UnauthorizeTransactionEventFactory.create({
                    transaction: '',
                    occurred_at: new Date(),
                    authorization: authorization
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'transaction');

                return true;
            }
        );
    });

    it('承認が空なので作成できない', () => {
        const authorization: any = {};
        assert.throws(
            () => {
                UnauthorizeTransactionEventFactory.create({
                    transaction: 'xxx',
                    occurred_at: new Date(),
                    authorization: authorization
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'authorization');

                return true;
            }
        );
    });
});
