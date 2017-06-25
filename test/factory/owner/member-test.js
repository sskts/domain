"use strict";
/**
 * 会員所有者ファクトリーテスト
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
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const MemberOwnerFactory = require("../../../lib/factory/owner/member");
const TEST_CREATE_MEMBER_ARGS = {
    username: 'xxx',
    password: 'xxx',
    name_first: 'xxx',
    name_last: 'xxx',
    email: 'noreply@example.com'
};
describe('会員所有者ファクトリー', () => {
    it('作成できる', () => __awaiter(this, void 0, void 0, function* () {
        const memberOwner = yield MemberOwnerFactory.create(TEST_CREATE_MEMBER_ARGS);
        assert.equal(typeof memberOwner.id, 'string');
    }));
    it('ユーザーネームが空で作成できない', () => __awaiter(this, void 0, void 0, function* () {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { username: '' });
        const createError = yield MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof argumentNull_1.default);
        assert.equal(createError.argumentName, 'username');
    }));
    it('パスワードが空で作成できない', () => __awaiter(this, void 0, void 0, function* () {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { password: '' });
        const createError = yield MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof argumentNull_1.default);
        assert.equal(createError.argumentName, 'password');
    }));
    it('名が空で作成できない', () => __awaiter(this, void 0, void 0, function* () {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { name_first: '' });
        const createError = yield MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof argumentNull_1.default);
        assert.equal(createError.argumentName, 'name_first');
    }));
    it('姓が空で作成できない', () => __awaiter(this, void 0, void 0, function* () {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { name_last: '' });
        const createError = yield MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof argumentNull_1.default);
        assert.equal(createError.argumentName, 'name_last');
    }));
    it('メールアドレスが空で作成できない', () => __awaiter(this, void 0, void 0, function* () {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { email: '' });
        const createError = yield MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof argumentNull_1.default);
        assert.equal(createError.argumentName, 'email');
    }));
    it('メールアドレスが不適切なので作成できない', () => __awaiter(this, void 0, void 0, function* () {
        const args = Object.assign({}, TEST_CREATE_MEMBER_ARGS, { email: 'xxx' });
        const createError = yield MemberOwnerFactory.create(args).catch((error) => error);
        assert(createError instanceof argument_1.default);
        assert.equal(createError.argumentName, 'email');
    }));
});
