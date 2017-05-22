"use strict";
/**
 * パフォーマンス空席状況アダプターテスト
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
const performanceAvailability_1 = require("../../lib/adapter/performanceAvailability");
const REDIS_URL = 'redis://devsskts.redis.cache.windows.net:6380?password=W/yjVruvypTFz3nl8teXxBYfunq6teXnyvIN5xuVLWU=';
before(() => __awaiter(this, void 0, void 0, function* () {
    // 全て削除してからテスト開始el.remove({}).exec();
}));
describe('パフォーマンス空席状況アダプター 劇場で検索', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const adapter = new performanceAvailability_1.default(REDIS_URL);
        // テストデータ生成
        const performanceId = 'xxx';
        const availability = '○';
        yield adapter.saveByPerformance(performanceId, availability);
        const availabilityFromRedis = yield adapter.findByPerformance('118001');
        assert.equal(availabilityFromRedis, availability);
    }));
});
