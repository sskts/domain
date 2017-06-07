import * as redis from 'redis';
/**
 * 取引数redisアダプター
 *
 * @class TransactionCountAdapter
 */
export default class TransactionCountAdapter {
    static readonly KEY_PREFIX: string;
    readonly redisClient: redis.RedisClient;
    constructor(redisClient: redis.RedisClient);
}
