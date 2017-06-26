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
const assert = require("assert");
const mongoose = require("mongoose");
const sskts = require("../../lib/index");
// import ArgumentError from '../../lib/error/argument';
const MemberOwnerFactory = require("../../lib/factory/owner/member");
const ownerGroup_1 = require("../../lib/factory/ownerGroup");
const TEST_PASSWORD = 'password';
let TEST_MEMBER_OWNER;
const MemberService = require("../../lib/service/member");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const ownerAdapter = sskts.adapter.owner(connection);
    yield ownerAdapter.model.remove({ group: ownerGroup_1.default.ANONYMOUS }).exec();
    TEST_MEMBER_OWNER = yield MemberOwnerFactory.create({
        username: 'xxx',
        password: TEST_PASSWORD,
        name_first: 'xxx',
        name_last: 'xxx',
        email: 'noreplay@example.com'
    });
    yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
}));
after(() => __awaiter(this, void 0, void 0, function* () {
    // テスト会員削除
    const ownerAdapter = sskts.adapter.owner(connection);
    yield ownerAdapter.model.findByIdAndRemove(TEST_MEMBER_OWNER.id).exec();
}));
describe('会員サービス ログイン', () => {
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
