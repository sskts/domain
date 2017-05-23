/**
 * パフォーマンス在庫状況アダプターテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import PerformanceStockStatusAdapter from '../../../lib/adapter/stockStatus/performance';
import * as PerformanceStockStatusFactory from '../../../lib/factory/stockStatus/performance';

const TEST_PERFORMANCE_DAY = '20170428';
const TEST_PERFORMANCE_ID = '1234567890';

before(async () => {
    if (typeof process.env.TEST_REDIS_URL !== 'string') {
        throw new Error('environment variable TEST_REDIS_URL required');
    }
});

describe('パフォーマンス空席状況アダプター パフォーマンスIDで保管', () => {
    before(async () => {
        // 全て削除してからテスト開始
        const adapter = new PerformanceStockStatusAdapter(process.env.TEST_REDIS_URL);
        await adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    });

    it('ok', async () => {
        const adapter = new PerformanceStockStatusAdapter(process.env.TEST_REDIS_URL);

        let stockStatusFromRedis: any;
        stockStatusFromRedis = await adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);

        // テストデータ生成
        const expression = '○';
        await adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);

        stockStatusFromRedis = await adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal((<PerformanceStockStatusFactory.IPerformanceStockStatus>stockStatusFromRedis).expression, expression);
    });
});

describe('パフォーマンス空席状況アダプター 上映日から期限セット', () => {
    before(async () => {
        // 全て削除してからテスト開始
        const adapter = new PerformanceStockStatusAdapter(process.env.TEST_REDIS_URL);
        await adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    });

    it('ok', (done) => {
        const adapter = new PerformanceStockStatusAdapter(process.env.TEST_REDIS_URL);

        // tslint:disable-next-line:no-floating-promises
        adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID)
            .then((stockStatusFromRedis) => {
                assert.equal(stockStatusFromRedis, null);

                const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(TEST_PERFORMANCE_DAY);
                adapter.redisClient.ttl([key], async (err1, ttlBefore) => {
                    if (err1 instanceof Error) {
                        done(err1);

                        return;
                    }

                    assert(ttlBefore < 0);

                    // テストデータ生成
                    const expression = '○';
                    await adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);

                    // 期限セット
                    await adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);

                    // 期限セットされているはず
                    adapter.redisClient.ttl([key], async (err2, ttlAfter) => {
                        if (err2 instanceof Error) {
                            done(err2);

                            return;
                        }

                        assert(ttlAfter > 0);
                        done();
                    });
                });
            })
            .catch((err) => {
                done(err);
            });
    });
});
