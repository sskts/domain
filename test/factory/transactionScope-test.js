"use strict";
/**
 * 取引スコープファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const moment = require("moment");
const ownerGroup_1 = require("../../lib/factory/ownerGroup");
const TransactionScopeFactory = require("../../lib/factory/transactionScope");
const TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS = 60;
let TEST_CREATE_SCOPE_ARGS;
before(() => {
    const readyFrom = moment();
    const readyUntil = moment(readyFrom).add(TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS, 'seconds');
    TEST_CREATE_SCOPE_ARGS = {
        ready_from: readyFrom.toDate(),
        ready_until: readyUntil.toDate(),
        client: 'test',
        theater: '118',
        owner_group: ownerGroup_1.default.ANONYMOUS
    };
});
describe('取引スコープファクトリー 作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TransactionScopeFactory.create(TEST_CREATE_SCOPE_ARGS);
        });
    });
});
describe('取引スコープファクトリー 文字列変換', () => {
    it('変換できる', () => {
        const scope = TransactionScopeFactory.create(TEST_CREATE_SCOPE_ARGS);
        const str = TransactionScopeFactory.scope2String(scope);
        const result = /client:(.+):theater:(.+):owner_group:(.+)$/.exec(str);
        if (result === null) {
            throw new Error('invalid');
        }
        assert.deepEqual(
        // tslint:disable-next-line:no-magic-numbers
        result.splice(1, 3), [TEST_CREATE_SCOPE_ARGS.client, TEST_CREATE_SCOPE_ARGS.theater, TEST_CREATE_SCOPE_ARGS.owner_group]);
    });
});
