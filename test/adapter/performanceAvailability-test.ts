/**
 * パフォーマンス空席状況アダプターテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import PerformanceAvailabilityAdapter from '../../lib/adapter/performanceAvailability';

const TEST_PERFORMANCE_DAY = '20170428';
const TEST_PERFORMANCE_ID = '1234567890';

before(async () => {
    if (typeof process.env.TEST_REDIS_URL !== 'string') {
        throw new Error('environment variable TEST_REDIS_URL required');
    }

    // 全て削除してからテスト開始
    const adapter = new PerformanceAvailabilityAdapter(process.env.TEST_REDIS_URL);
    await adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
});

describe('パフォーマンス空席状況アダプター パフォーマンスIDで保管', () => {
    it('ok', async () => {
        const adapter = new PerformanceAvailabilityAdapter(process.env.TEST_REDIS_URL);

        let availabilityFromRedis: string;
        availabilityFromRedis = await adapter.findByPerformance(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(availabilityFromRedis, '');

        // テストデータ生成
        const availability = '○';
        await adapter.saveByPerformance(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, availability);

        availabilityFromRedis = await adapter.findByPerformance(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(availabilityFromRedis, availability);
    });
});
