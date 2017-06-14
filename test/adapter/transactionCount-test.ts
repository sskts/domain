/**
 * 取引数アダプターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as redis from 'redis';

import TransactionCountAdapter from '../../lib/adapter/transactionCount';
import * as TransactionScopeFactory from '../../lib/factory/transactionScope';

const TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS = 60;
let TEST_TRANSACTION_SCOPE: TransactionScopeFactory.ITransactionScope;
let redisClient: redis.RedisClient;

function createRedisClient() {
    return redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
}

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

    const readyFrom = moment();
    const readyUntil = moment(readyFrom).add(TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS, 'seconds');

    TEST_TRANSACTION_SCOPE = TransactionScopeFactory.create({
        ready_from: readyFrom.toDate(),
        ready_until: readyUntil.toDate()
    });
});

describe('取引数アダプター カウントアップ', () => {
    beforeEach(() => {
        redisClient = createRedisClient();
    });

    it('カウントアップの前後で差が1のはず', async () => {
        const transactionCountAdapter = new TransactionCountAdapter(redisClient);
        const countBefore = await transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE);
        await transactionCountAdapter.incr(TEST_TRANSACTION_SCOPE);
        const countAfter = await transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE);
        assert.equal(countAfter, countBefore + 1);
    });

    it('redis接続切断されたらエラー', async () => {
        await new Promise((resolve) => {
            redisClient.quit(async () => {
                const transactionCountAdapter = new TransactionCountAdapter(redisClient);
                const getError = await transactionCountAdapter.incr(TEST_TRANSACTION_SCOPE)
                    .catch((error) => {
                        return error;
                    });
                assert(getError instanceof Error);

                resolve();
            });
        });
    });
});

describe('取引数アダプター スコープからカウント取得', () => {
    beforeEach(() => {
        redisClient = createRedisClient();
    });

    it('カウントアップの前後で差が1のはず', async () => {
        const transactionCountAdapter = new TransactionCountAdapter(redisClient);
        const count = await transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE);
        assert.equal(typeof count, 'number');
    });

    it('redis接続切断されたらエラー', async () => {
        await new Promise((resolve) => {
            redisClient.quit(async () => {
                const transactionCountAdapter = new TransactionCountAdapter(redisClient);
                const getError = await transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE)
                    .catch((error) => {
                        return error;
                    });
                assert(getError instanceof Error);

                resolve();
            });
        });
    });
});
