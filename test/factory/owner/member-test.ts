/**
 * 会員所有者ファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';

import * as MemberOwnerFactory from '../../../lib/factory/owner/member';
import PaymentAgencyMemberGroup from '../../../lib/factory/paymentAgencyMemberGroup';

const TEST_CREATE_MEMBER_ARGS = {
    username: 'xxx',
    password_hash: 'xxx',
    name_first: 'xxx',
    name_last: 'xxx',
    email: 'noreply@example.com',
    payment_agency_members: [
        {
            group: PaymentAgencyMemberGroup.GMO,
            site_id: 'xxx',
            site_pass: 'xxx',
            member_id: 'xxx'
        }
    ]
};

describe('会員所有者ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            MemberOwnerFactory.create(TEST_CREATE_MEMBER_ARGS);
        });
    });

    it('ユーザーネームが空で作成できない', () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ username: '' } };
        assert.throws(
            () => {
                MemberOwnerFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'username');

                return true;
            }
        );
    });

    it('パスワードが空で作成できない', () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ password_hash: '' } };
        assert.throws(
            () => {
                MemberOwnerFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'password_hash');

                return true;
            }
        );
    });

    it('名が空で作成できない', () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ name_first: '' } };
        assert.throws(
            () => {
                MemberOwnerFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'name_first');

                return true;
            }
        );
    });

    it('姓が空で作成できない', () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ name_last: '' } };
        assert.throws(
            () => {
                MemberOwnerFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'name_last');

                return true;
            }
        );
    });

    it('メールアドレスが空で作成できない', () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ email: '' } };
        assert.throws(
            () => {
                MemberOwnerFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'email');

                return true;
            }
        );
    });

    it('メールアドレスが不適切なので作成できない', () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ email: 'xxx' } };
        assert.throws(
            () => {
                MemberOwnerFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'email');

                return true;
            }
        );
    });
});
