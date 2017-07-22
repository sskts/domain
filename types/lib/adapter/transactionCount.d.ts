import * as redis from 'redis';
import * as ActionScopeFactory from '../factory/actionScope';
/**
 * 取引数redisアダプター
 *
 * @class TransactionCountAdapter
 */
export default class TransactionCountAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisClient: redis.RedisClient);
    static SCOPE2KEY(scope: ActionScopeFactory.IActionScope): string;
    incr(scope: ActionScopeFactory.IActionScope): Promise<number>;
    getByScope(scope: ActionScopeFactory.IActionScope): Promise<number>;
}
