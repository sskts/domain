/**
 * 資産移動キューファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as GmoAuthorizationFactory from '../../../lib/factory/authorization/gmo';
import * as SettleAuthorizationQueueFactory from '../../../lib/factory/queue/settleAuthorization';
import QueueStatus from '../../../lib/factory/queueStatus';

describe('資産移動キューファクトリー', () => {
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
            SettleAuthorizationQueueFactory.create({
                authorization: authorization,
                status: QueueStatus.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        });
    });

    it('承認が空なので作成できない', () => {
        assert.throws(
            () => {
                SettleAuthorizationQueueFactory.create({
                    authorization: <any>{},
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'authorization');
                return true;
            }
        );
    });

    it('ステータスが空なので作成できない', () => {
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
                SettleAuthorizationQueueFactory.create({
                    authorization: authorization,
                    status: <any>'',
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'status');
                return true;
            }
        );
    });

    it('実行日時が不適切なので作成できない', () => {
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
                SettleAuthorizationQueueFactory.create({
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: <any>(new Date()).toString,
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'run_at');
                return true;
            }
        );
    });

    it('最大試行回数が数字でないので作成できない', () => {
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
                SettleAuthorizationQueueFactory.create({
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: <any>'10',
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'max_count_try');
                return true;
            }
        );
    });

    it('最終試行日時が不適切なので作成できない', () => {
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
                SettleAuthorizationQueueFactory.create({
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: <any>{},
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'last_tried_at');
                return true;
            }
        );
    });

    it('試行回数が数字でないので作成できない', () => {
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
                SettleAuthorizationQueueFactory.create({
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: <any>'0',
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'count_tried');
                return true;
            }
        );
    });

    it('結果が配列でないので作成できない', () => {
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
                SettleAuthorizationQueueFactory.create({
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: <any>{}
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'results');
                return true;
            }
        );
    });
});
