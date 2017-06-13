/**
 * GMOオーソリファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as GMOAuthorizationFactory from '../../../lib/factory/authorization/gmo';

let TEST_CREATE_GMO_AUTHORIZATION_ARGS: any;
before(async () => {
    TEST_CREATE_GMO_AUTHORIZATION_ARGS = {
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
    };
});

describe('GMOオーソリファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            GMOAuthorizationFactory.create(TEST_CREATE_GMO_AUTHORIZATION_ARGS);
        });
    });

    it('所有者fromが空なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ owner_from: '' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'owner_from');

                return true;
            }
        );
    });

    it('所有者toが空なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ owner_to: '' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'owner_to');

                return true;
            }
        );
    });

    it('ショップIDが空なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ gmo_shop_id: '' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'gmo_shop_id');

                return true;
            }
        );
    });

    it('ショップパスが空なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ gmo_shop_pass: '' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'gmo_shop_pass');

                return true;
            }
        );
    });

    it('オーダーIDが空なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ gmo_order_id: '' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'gmo_order_id');

                return true;
            }
        );
    });

    it('アクセスIDが空なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ gmo_access_id: '' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'gmo_access_id');

                return true;
            }
        );
    });

    it('アクセスパスが空なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ gmo_access_pass: '' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'gmo_access_pass');

                return true;
            }
        );
    });

    it('金額が数字でないので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ price: '123' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'price');

                return true;
            }
        );
    });

    it('GMO金額が数字でないので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ gmo_amount: '123' } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'gmo_amount');

                return true;
            }
        );
    });

    it('価格が0以下なので作成できない', () => {
        const args = { ...TEST_CREATE_GMO_AUTHORIZATION_ARGS, ...{ price: 0 } };
        assert.throws(
            () => {
                GMOAuthorizationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'price');

                return true;
            }
        );
    });
});
