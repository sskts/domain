"use strict";
/**
 * 会員所有者ファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const MemberOwnerFactory = require("../../../lib/factory/owner/member");
const paymentAgencyMemberGroup_1 = require("../../../lib/factory/paymentAgencyMemberGroup");
const TEST_CREATE_MEMBER_ARGS = {
    username: 'xxx',
    password_hash: 'xxx',
    name_first: 'xxx',
    name_last: 'xxx',
    email: 'noreply@example.com',
    payment_agency_members: [
        {
            group: paymentAgencyMemberGroup_1.default.GMO,
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
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { username: '' });
        assert.throws(() => {
            MemberOwnerFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'username');
            return true;
        });
    });
    it('パスワードが空で作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { password_hash: '' });
        assert.throws(() => {
            MemberOwnerFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'password_hash');
            return true;
        });
    });
    it('名が空で作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { name_first: '' });
        assert.throws(() => {
            MemberOwnerFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'name_first');
            return true;
        });
    });
    it('姓が空で作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { name_last: '' });
        assert.throws(() => {
            MemberOwnerFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'name_last');
            return true;
        });
    });
    it('メールアドレスが空で作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { email: '' });
        assert.throws(() => {
            MemberOwnerFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'email');
            return true;
        });
    });
    it('メールアドレスが不適切なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { email: 'xxx' });
        assert.throws(() => {
            MemberOwnerFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'email');
            return true;
        });
    });
});
