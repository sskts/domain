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
    // 全て削除してからテスト開始
    const adapter = new performance_1.default(process.env.TEST_REDIS_URL);
    yield adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
}));
describe('パフォーマンス空席状況アダプター パフォーマンスIDで保管', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const adapter = new performance_1.default(process.env.TEST_REDIS_URL);
        let availabilityFromRedis;
        availabilityFromRedis = yield adapter.findByPerformance(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(availabilityFromRedis, null);
        // テストデータ生成
        const availability = '○';
        yield adapter.saveByPerformance(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, availability);
        availabilityFromRedis = yield adapter.findByPerformance(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(availabilityFromRedis, availability);
    }));
});
