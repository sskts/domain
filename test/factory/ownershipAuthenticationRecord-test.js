"use strict";
/**
 * 所有権認証記録ファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const argument_1 = require("../../lib/error/argument");
const argumentNull_1 = require("../../lib/error/argumentNull");
const OwnershipAuthenticationRecordFactory = require("../../lib/factory/ownershipAuthenticationRecord");
// 所有権認証記録生成メソッドの有効なパラメーター
let validCreateOwnershipAuthenticationRecordArgs;
before(() => {
    validCreateOwnershipAuthenticationRecordArgs = {
        when: new Date(),
        where: 'xxx',
        why: 'xxx',
        how: 'xxx'
    };
});
describe('所有権認証記録ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            OwnershipAuthenticationRecordFactory.create(validCreateOwnershipAuthenticationRecordArgs);
        });
    });
    it('「いつ」がDateでないので作成できない', () => {
        const args = Object.assign({}, validCreateOwnershipAuthenticationRecordArgs);
        const when = '2017-05-20T06:24:32.910Z';
        args.when = when;
        assert.throws(() => {
            OwnershipAuthenticationRecordFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'when');
            return true;
        });
    });
    it('「どこで」が空なので作成できない', () => {
        const args = Object.assign({}, validCreateOwnershipAuthenticationRecordArgs);
        args.where = '';
        assert.throws(() => {
            OwnershipAuthenticationRecordFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'where');
            return true;
        });
    });
    it('「何のために」が空なので作成できない', () => {
        const args = Object.assign({}, validCreateOwnershipAuthenticationRecordArgs);
        args.why = '';
        assert.throws(() => {
            OwnershipAuthenticationRecordFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'why');
            return true;
        });
    });
    it('「どうやって」が空なので作成できない', () => {
        const args = Object.assign({}, validCreateOwnershipAuthenticationRecordArgs);
        args.how = '';
        assert.throws(() => {
            OwnershipAuthenticationRecordFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'how');
            return true;
        });
    });
});
