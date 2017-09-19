/**
 * パフォーマンス在庫状況アダプターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as redis from 'redis';

import PerformanceStockStatusAdapter from '../../../lib/adapter/stockStatus/performance';
import * as PerformanceStockStatusFactory from '../../../lib/factory/stockStatus/performance';

const TEST_PERFORMANCE_DAY = '20170428';
const TEST_PERFORMANCE_ID = '1234567890';
const TEST_PERFORMANCE_STOCK_STATUS_EXPRESSION = 33;

let redisClient: redis.RedisClient;
before(async () => {
    if (typeof process.env.TEST_REDIS_HOST !== 'string') {
        throw new Error('environment variable TEST_REDIS_HOST required');
    }

    if (typeof process.env.TEST_REDIS_PORT !== 'string') {
        throw new Error('environment variable TEST_REDIS_PORT required');
    }

    if (typeof process.env.TEST_REDIS_KEY !== 'string') {
        throw new Error('environment variable TEST_REDIS_KEY required');
    }

    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
});

describe('パフォーマンス空席状況アダプター パフォーマンスIDで検索', () => {
    beforeEach(async () => {
        // 全て削除してからテスト開始
        const adapter = new PerformanceStockStatusAdapter(redisClient);
        await adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    });

    it('redis接続されたらエラー', async () => {
        const client = redisClient.duplicate();
        const adapter = new PerformanceStockStatusAdapter(client);

        await Promise.all([new Promise((resolve, reject) => {
            // 接続切断後に取得しようとしてもエラーになるはず
            client.quit(async () => {
                try {
                    await adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
                } catch (error) {
                    resolve();

                    return;
                }

                reject('should not be passed');
            });
        })]);
    });
});

describe('パフォーマンス空席状況アダプター パフォーマンスIDで保管', () => {
    beforeEach(async () => {
        // 全て削除してからテスト開始
        const adapter = new PerformanceStockStatusAdapter(redisClient);
        await adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    });

    it('ok', async () => {
        const client = redisClient.duplicate();
        const adapter = new PerformanceStockStatusAdapter(client);

        let stockStatusFromRedis: any;
        stockStatusFromRedis = await adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);

        // テストデータ生成
        await adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, TEST_PERFORMANCE_STOCK_STATUS_EXPRESSION);

        stockStatusFromRedis = await adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(
            (<PerformanceStockStatusFactory.IStockStatus>stockStatusFromRedis).expression,
            TEST_PERFORMANCE_STOCK_STATUS_EXPRESSION
        );
    });

    it('redis接続されたらエラー', async () => {
        const client = redisClient.duplicate();
        const adapter = new PerformanceStockStatusAdapter(client);

        await new Promise((resolve, reject) => {
            // 接続切断後に更新しようとしてもエラーになるはず
            client.quit(async () => {
                // テストデータ生成
                try {
                    await adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, TEST_PERFORMANCE_STOCK_STATUS_EXPRESSION);
                } catch (error) {
                    resolve();

                    return;
                }

                reject('should not be passed');
            });
        });
    });
});

describe('パフォーマンス空席状況アダプター 上映日から期限セット', () => {
    beforeEach(async () => {
        // 全て削除してからテスト開始
        const adapter = new PerformanceStockStatusAdapter(redisClient);
        await adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    });

    it('ok', async () => {
        const client = redisClient.duplicate();
        const adapter = new PerformanceStockStatusAdapter(client);

        const stockStatusFromRedis = await adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);

        const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(TEST_PERFORMANCE_DAY);
        await new Promise((resolve, reject) => {
            adapter.redisClient.ttl([key], async (err1, ttlBefore) => {
                if (err1 instanceof Error) {
                    reject(err1);

                    return;
                }

                try {
                    assert(ttlBefore < 0);

                    // テストデータ生成
                    await adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, TEST_PERFORMANCE_STOCK_STATUS_EXPRESSION);

                    // 期限セット
                    await adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);

                    // 期限セットされているはず
                    adapter.redisClient.ttl([key], async (err2, ttlAfter) => {
                        if (err2 instanceof Error) {
                            reject(err2);

                            return;
                        }

                        try {
                            assert(ttlAfter > 0);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });
    });

    it('redis接続されたらエラー', async () => {
        const client = redisClient.duplicate();
        const adapter = new PerformanceStockStatusAdapter(client);

        await new Promise((resolve, reject) => {
            // 接続切断後に更新しようとしてもエラーになるはず
            client.quit(async () => {
                try {
                    await adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);
                } catch (error) {
                    resolve();

                    return;
                }

                reject('should not be passed');
            });
        });
    });

    it('期限セット済みであれば何もしない', async () => {
        const client = redisClient.duplicate();
        const adapter = new PerformanceStockStatusAdapter(client);
        const TIMEOUT_IN_SECONDS = 3600;

        const stockStatusFromRedis = await adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);

        const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(TEST_PERFORMANCE_DAY);

        // テストデータ生成
        await adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, TEST_PERFORMANCE_STOCK_STATUS_EXPRESSION);

        await new Promise((resolve, reject) => {
            adapter.redisClient.expire([key, TIMEOUT_IN_SECONDS], async () => {
                try {
                    // 期限セット
                    await adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);

                    // 期限セットされているはず
                    adapter.redisClient.ttl([key], async (err2, ttlAfter) => {
                        if (err2 instanceof Error) {
                            reject(err2);

                            return;
                        }

                        try {
                            assert(ttlAfter > 0);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });
    });
});
