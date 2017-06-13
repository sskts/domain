"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * GMOオーソリファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const GMOAuthorizationFactory = require("../../../lib/factory/authorization/gmo");
let TEST_CREATE_GMO_AUTHORIZATION_ARGS;
before(() => __awaiter(this, void 0, void 0, function* () {
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
}));
describe('GMOオーソリファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            GMOAuthorizationFactory.create(TEST_CREATE_GMO_AUTHORIZATION_ARGS);
        });
    });
    it('所有者fromが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { owner_from: '' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'owner_from');
            return true;
        });
    });
    it('所有者toが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { owner_to: '' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'owner_to');
            return true;
        });
    });
    it('ショップIDが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { gmo_shop_id: '' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'gmo_shop_id');
            return true;
        });
    });
    it('ショップパスが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { gmo_shop_pass: '' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'gmo_shop_pass');
            return true;
        });
    });
    it('オーダーIDが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { gmo_order_id: '' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'gmo_order_id');
            return true;
        });
    });
    it('アクセスIDが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { gmo_access_id: '' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'gmo_access_id');
            return true;
        });
    });
    it('アクセスパスが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { gmo_access_pass: '' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'gmo_access_pass');
            return true;
        });
    });
    it('金額が数字でないので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { price: '123' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'price');
            return true;
        });
    });
    it('GMO金額が数字でないので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { gmo_amount: '123' });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'gmo_amount');
            return true;
        });
    });
    it('価格が0以下なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_GMO_AUTHORIZATION_ARGS, { price: 0 });
        assert.throws(() => {
            GMOAuthorizationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'price');
            return true;
        });
    });
});
