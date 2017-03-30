"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 興行所有者ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const PromoterOwnerFactory = require("../../../lib/factory/owner/promoter");
describe('興行所有者ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            PromoterOwnerFactory.create({});
        });
    });
});
