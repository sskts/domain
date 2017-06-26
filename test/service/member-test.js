"use strict";
/**
 * 会員サービステスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GMO = require("@motionpicture/gmo-service");
const assert = require("assert");
const mongoose = require("mongoose");
const sskts = require("../../lib/index");
const argument_1 = require("../../lib/error/argument");
const cardGroup_1 = require("../../lib/factory/cardGroup");
const MemberOwnerFactory = require("../../lib/factory/owner/member");
const ownerGroup_1 = require("../../lib/factory/ownerGroup");
const TEST_PASSWORD = 'password';
let TEST_MEMBER_OWNER;
let TEST_MEMBER_VARIABLE_FIELDS;
const TEST_GMO_CARD = {
    cardNo: '4111111111111111',
    cardPass: '111',
    expire: '1812',
    holderName: 'AA BB',
    group: cardGroup_1.default.GMO
};
const MemberService = require("../../lib/service/member");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const ownerAdapter = sskts.adapter.owner(connection);
    yield ownerAdapter.model.remove({ group: ownerGroup_1.default.ANONYMOUS }).exec();
    TEST_MEMBER_OWNER = yield MemberOwnerFactory.create({
        username: 'username',
        password: TEST_PASSWORD,
        name_first: 'name_first',
        name_last: 'name_last',
        email: 'noreplay@example.com'
    });
    // GMO会員登録
    yield GMO.services.card.saveMember({
        siteId: process.env.GMO_SITE_ID,
        sitePass: process.env.GMO_SITE_PASS,
        memberId: TEST_MEMBER_OWNER.id,
        memberName: `${TEST_MEMBER_OWNER.name_last} ${TEST_MEMBER_OWNER.name_first}`
    });
    TEST_MEMBER_VARIABLE_FIELDS = {
        name_first: 'new first name',
        name_last: 'new last name',
        email: 'new@example.com',
        tel: '09012345678',
        description: { en: 'new description en', ja: 'new description ja' },
        notes: { en: 'new notes en', ja: 'new notes ja' }
    };
}));
after(() => __awaiter(this, void 0, void 0, function* () {
    // テスト会員削除
    const ownerAdapter = sskts.adapter.owner(connection);
    yield ownerAdapter.model.findByIdAndRemove(TEST_MEMBER_OWNER.id).exec();
}));
describe('会員サービス ログイン', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('ユーザーネームが存在しなければログインできない', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        const memberOwnerOption = yield MemberService.login(`${TEST_MEMBER_OWNER.username}x`, TEST_PASSWORD)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    }));
    it('パスワードが間違っていればログインできない', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        const memberOwnerOption = yield MemberService.login(TEST_MEMBER_OWNER.username, `${TEST_PASSWORD}x`)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    }));
    it('ログインできる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        // ログインできて、属性が正しいことを確認、ハッシュ化パスワードが返されていないことも確認
        const loginResult = yield MemberService.login(TEST_MEMBER_OWNER.username, TEST_PASSWORD)(ownerAdapter);
        assert(loginResult.isDefined);
        const memberOwner = loginResult.get();
        assert.equal(memberOwner.id, TEST_MEMBER_OWNER.id);
        assert.equal(memberOwner.username, TEST_MEMBER_OWNER.username);
    }));
});
describe('会員サービス プロフィール更新', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('会員が存在しなければエラー', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        const memberOwner = yield MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const updateProfileError = yield MemberService.updateProfile(memberOwner.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter)
            .catch((error) => error);
        assert(updateProfileError instanceof argument_1.default);
        assert.equal(updateProfileError.argumentName, 'ownerId');
    }));
    it('正しく更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        yield MemberService.updateProfile(TEST_MEMBER_OWNER.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter);
        const memberOwnerDoc = yield ownerAdapter.model.findById(TEST_MEMBER_OWNER.id).exec();
        const memberOwner = memberOwnerDoc.toObject();
        assert.equal(memberOwner.name_first, TEST_MEMBER_VARIABLE_FIELDS.name_first);
        assert.equal(memberOwner.name_last, TEST_MEMBER_VARIABLE_FIELDS.name_last);
        assert.equal(memberOwner.email, TEST_MEMBER_VARIABLE_FIELDS.email);
        assert.equal(memberOwner.tel, TEST_MEMBER_VARIABLE_FIELDS.tel);
        assert.deepEqual(memberOwner.description, TEST_MEMBER_VARIABLE_FIELDS.description);
        assert.deepEqual(memberOwner.notes, TEST_MEMBER_VARIABLE_FIELDS.notes);
    }));
});
describe('会員サービス カード追加', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('会員が存在しなければエラー', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        const memberOwner = yield MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const addCardError = yield MemberService.addCard(memberOwner.id, TEST_GMO_CARD)(ownerAdapter)
            .catch((error) => error);
        assert(addCardError instanceof argument_1.default);
        assert.equal(addCardError.argumentName, 'ownerId');
    }));
    it('正しく追加できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        // GMOに確かにカードが登録されていることを確認
        const newCardSeq = yield MemberService.addCard(TEST_MEMBER_OWNER.id, TEST_GMO_CARD)(ownerAdapter);
        const searchCardResults = yield GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: newCardSeq
        });
        assert.equal(searchCardResults.length, 1);
    }));
});
