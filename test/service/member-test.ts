/**
 * 会員サービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

// import ArgumentError from '../../lib/error/argument';

import * as MemberOwnerFactory from '../../lib/factory/owner/member';
import OwnerGroup from '../../lib/factory/ownerGroup';

const TEST_PASSWORD = 'password';
let TEST_MEMBER_OWNER: MemberOwnerFactory.IMemberOwner;

import * as MemberService from '../../lib/service/member';

let connection: mongoose.Connection;

before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const ownerAdapter = sskts.adapter.owner(connection);
    await ownerAdapter.model.remove({ group: OwnerGroup.ANONYMOUS }).exec();

    TEST_MEMBER_OWNER = await MemberOwnerFactory.create({
        username: 'xxx',
        password: TEST_PASSWORD,
        name_first: 'xxx',
        name_last: 'xxx',
        email: 'noreplay@example.com'
    });
    await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
});

after(async () => {
    // テスト会員削除
    const ownerAdapter = sskts.adapter.owner(connection);
    await ownerAdapter.model.findByIdAndRemove(TEST_MEMBER_OWNER.id).exec();
});

describe('会員サービス ログイン', () => {
    it('ユーザーネームが存在しなければログインできない', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);

        const memberOwnerOption = await MemberService.login(`${TEST_MEMBER_OWNER.username}x`, TEST_PASSWORD)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    });

    it('パスワードが間違っていればログインできない', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);

        const memberOwnerOption = await MemberService.login(TEST_MEMBER_OWNER.username, `${TEST_PASSWORD}x`)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    });

    it('ログインできる', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);

        // ログインできて、属性が正しいことを確認、ハッシュ化パスワードが返されていないことも確認
        const loginResult = await MemberService.login(TEST_MEMBER_OWNER.username, TEST_PASSWORD)(ownerAdapter);
        assert(loginResult.isDefined);
        const memberOwner = loginResult.get();
        assert.equal(memberOwner.id, TEST_MEMBER_OWNER.id);
        assert.equal(memberOwner.username, TEST_MEMBER_OWNER.username);
    });
});
