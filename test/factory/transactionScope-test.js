"use strict";
/**
 * 取引スコープファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const ownerGroup_1 = require("../../lib/factory/ownerGroup");
const TransactionScopeFactory = require("../../lib/factory/transactionScope");
const TEST_VALID_SCOPE = {
    client: 'test',
    theater: '118',
    owner_group: ownerGroup_1.default.ANONYMOUS
};
describe('取引スコープファクトリー 作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TransactionScopeFactory.create({
                client: TEST_VALID_SCOPE.client,
                theater: TEST_VALID_SCOPE.theater,
                owner_group: TEST_VALID_SCOPE.owner_group
            });
        });
    });
});
describe('取引スコープファクトリー 文字列変換', () => {
    it('変換できる', () => {
        const str = TransactionScopeFactory.scope2String(TEST_VALID_SCOPE);
        const result = /client:(.+):theater:(.+):owner_group:(.+)$/.exec(str);
        if (result === null) {
            throw new Error('invalid');
        }
        // tslint:disable-next-line:no-magic-numbers
        assert.deepEqual(result.splice(1, 3), [TEST_VALID_SCOPE.client, TEST_VALID_SCOPE.theater, TEST_VALID_SCOPE.owner_group]);
    });
});
