import * as redis from 'redis';

/**
 * 取引数redisアダプター
 *
 * @class TransactionCountAdapter
 */
export default class TransactionCountAdapter {
    public static readonly KEY_PREFIX: string = 'sskts-domain:transactionCount';
    public readonly redisClient: redis.RedisClient;

    constructor(redisClient: redis.RedisClient) {
        this.redisClient = redisClient;
    }
}
