/**
 * 会員所有者ファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';

import * as MemberOwnerFactory from '../../../lib/factory/owner/member';

const TEST_CREATE_MEMBER_ARGS = {
    username: 'xxx',
    password: 'xxx',
    name_first: 'xxx',
    name_last: 'xxx',
    email: 'noreply@example.com'
};

describe('会員所有者ファクトリー', () => {
    it('作成できる', async () => {
        const memberOwner = await MemberOwnerFactory.create(TEST_CREATE_MEMBER_ARGS);
        assert.equal(typeof memberOwner.id, 'string');
    });

    it('ユーザーネームが空で作成できない', async () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ username: '' } };
        const createError = await MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof ArgumentNullError);
        assert.equal((<ArgumentNullError>createError).argumentName, 'username');
    });

    it('パスワードが空で作成できない', async () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ password: '' } };
        const createError = await MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof ArgumentNullError);
        assert.equal((<ArgumentNullError>createError).argumentName, 'password');
    });

    it('名が空で作成できない', async () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ name_first: '' } };
        const createError = await MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof ArgumentNullError);
        assert.equal((<ArgumentNullError>createError).argumentName, 'name_first');
    });

    it('姓が空で作成できない', async () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ name_last: '' } };
        const createError = await MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof ArgumentNullError);
        assert.equal((<ArgumentNullError>createError).argumentName, 'name_last');
    });

    it('メールアドレスが空で作成できない', async () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ email: '' } };
        const createError = await MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof ArgumentNullError);
        assert.equal((<ArgumentNullError>createError).argumentName, 'email');
    });

    it('メールアドレスが不適切なので作成できない', async () => {
        const args = { ...TEST_CREATE_MEMBER_ARGS, ...{ email: 'xxx' } };
        const createError = await MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof ArgumentError);
        assert.equal((<ArgumentError>createError).argumentName, 'email');
    });
});
