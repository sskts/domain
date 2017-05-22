/**
 * パフォーマンス空席状況アダプターテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import PerformanceAvailabilityAdapter from '../../lib/adapter/performanceAvailability';

const REDIS_URL = 'redis://devsskts.redis.cache.windows.net:6380?password=W/yjVruvypTFz3nl8teXxBYfunq6teXnyvIN5xuVLWU=';

before(async () => {
    // 全て削除してからテスト開始el.remove({}).exec();
});

describe('パフォーマンス空席状況アダプター 劇場で検索', () => {
    it('ok', async () => {
        const adapter = new PerformanceAvailabilityAdapter(REDIS_URL);

        // テストデータ生成
        const performanceId = 'xxx';
        const availability = '○';
        await adapter.saveByPerformance(performanceId, availability);

        const availabilityFromRedis = await adapter.findByPerformance('118001');
        assert.equal(availabilityFromRedis, availability);
    });
});
