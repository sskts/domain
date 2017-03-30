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
        OwnershipFactory.create({
            owner: 'xxx',
            authenticated: false
        });
    });
    it('所有者空なので作成できない', () => {
        let createError;
        try {
            OwnershipFactory.create({
                owner: '',
                authenticated: false
            });
        }
        catch (error) {
            createError = error;
        }
        assert(createError instanceof argumentNull_1.default);
        assert.equal(createError.argumentName, 'owner');
    });
});
