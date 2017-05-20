"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 所有権ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argumentNull_1 = require("../../lib/error/argumentNull");
const OwnershipFactory = require("../../lib/factory/ownership");
describe('所有権ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            OwnershipFactory.create({
                owner: 'xxx'
            });
        });
    });
    it('所有者空なので作成できない', () => {
        assert.throws(() => {
            OwnershipFactory.create({
                owner: ''
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'owner');
            return true;
        });
    });
});
