"use strict";
/**
 * パフォーマンス在庫状況アダプターテスト
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
const performance_1 = require("../../../lib/adapter/stockStatus/performance");
const TEST_PERFORMANCE_DAY = '20170428';
const TEST_PERFORMANCE_ID = '1234567890';
before(() => __awaiter(this, void 0, void 0, function* () {
    if (typeof process.env.TEST_REDIS_URL !== 'string') {
        throw new Error('environment variable TEST_REDIS_URL required');
    }
}));
describe('パフォーマンス空席状況アダプター パフォーマンスIDで保管', () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        // 全て削除してからテスト開始
        const adapter = new performance_1.default(process.env.TEST_REDIS_URL);
        yield adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const adapter = new performance_1.default(process.env.TEST_REDIS_URL);
        let stockStatusFromRedis;
        stockStatusFromRedis = yield adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);
        // テストデータ生成
        const expression = '○';
        yield adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);
        stockStatusFromRedis = yield adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis.expression, expression);
    }));
});
describe('パフォーマンス空席状況アダプター 上映日から期限セット', () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        // 全て削除してからテスト開始
        const adapter = new performance_1.default(process.env.TEST_REDIS_URL);
        yield adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    }));
    it('ok', (done) => {
        const adapter = new performance_1.default(process.env.TEST_REDIS_URL);
        // tslint:disable-next-line:no-floating-promises
        adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID)
            .then((stockStatusFromRedis) => {
            assert.equal(stockStatusFromRedis, null);
            const key = performance_1.default.CREATE_REDIS_KEY(TEST_PERFORMANCE_DAY);
            adapter.redisClient.ttl([key], (err1, ttlBefore) => __awaiter(this, void 0, void 0, function* () {
                if (err1 instanceof Error) {
                    done(err1);
                    return;
                }
                assert(ttlBefore < 0);
                // テストデータ生成
                const expression = '○';
                yield adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);
                // 期限セット
                yield adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);
                // 期限セットされているはず
                adapter.redisClient.ttl([key], (err2, ttlAfter) => __awaiter(this, void 0, void 0, function* () {
                    if (err2 instanceof Error) {
                        done(err2);
                        return;
                    }
                    assert(ttlAfter > 0);
                    done();
                }));
            }));
        })
            .catch((err) => {
            done(err);
        });
    });
});
