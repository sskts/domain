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
let TEST_MEMBER_VARIABLE_FIELDS: MemberOwnerFactory.IVariableFields;

import * as MemberService from '../../lib/service/member';

let connection: mongoose.Connection;

before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const ownerAdapter = sskts.adapter.owner(connection);
    await ownerAdapter.model.remove({ group: OwnerGroup.ANONYMOUS }).exec();

    TEST_MEMBER_OWNER = await MemberOwnerFactory.create({
        username: 'username',
        password: TEST_PASSWORD,
        name_first: 'name_first',
        name_last: 'name_last',
        email: 'noreplay@example.com'
    });

    TEST_MEMBER_VARIABLE_FIELDS = {
        name_first: 'new first name',
        name_last: 'new last name',
        email: 'new@example.com',
        tel: '09012345678',
        description: { en: 'new description en', ja: 'new description ja' },
        notes: { en: 'new notes en', ja: 'new notes ja' }
    };
});

after(async () => {
    // テスト会員削除
    const ownerAdapter = sskts.adapter.owner(connection);
    await ownerAdapter.model.findByIdAndRemove(TEST_MEMBER_OWNER.id).exec();
});

describe('会員サービス ログイン', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

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

describe('会員サービス プロフィール更新', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('会員が存在しなければエラー', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);

        const memberOwner = await MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const updateProfileError = await MemberService.updateProfile(memberOwner.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter)
            .catch((error) => error);

        assert(updateProfileError instanceof Error);
    });

    it('正しく更新できる', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);

        await MemberService.updateProfile(TEST_MEMBER_OWNER.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter);

        const memberOwnerDoc = await ownerAdapter.model.findById(TEST_MEMBER_OWNER.id).exec();
        const memberOwner = <MemberOwnerFactory.IMemberOwner>(<mongoose.Document>memberOwnerDoc).toObject();
        assert.equal(memberOwner.name_first, TEST_MEMBER_VARIABLE_FIELDS.name_first);
        assert.equal(memberOwner.name_last, TEST_MEMBER_VARIABLE_FIELDS.name_last);
        assert.equal(memberOwner.email, TEST_MEMBER_VARIABLE_FIELDS.email);
        assert.equal(memberOwner.tel, TEST_MEMBER_VARIABLE_FIELDS.tel);
        assert.deepEqual(memberOwner.description, TEST_MEMBER_VARIABLE_FIELDS.description);
        assert.deepEqual(memberOwner.notes, TEST_MEMBER_VARIABLE_FIELDS.notes);
    });
});
