"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 一般所有者ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const AnonymousOwnerFactory = require("../../../lib/factory/owner/anonymous");
describe('一般所有者ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            AnonymousOwnerFactory.create({});
        });
    });
    it('メールアドレスが不適切なので作成できない', () => {
        assert.throws(() => {
            AnonymousOwnerFactory.create({
                email: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'email');
            return true;
        });
    });
});
