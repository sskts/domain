import * as redis from 'redis';
import * as TransactionScopeFactory from '../factory/transactionScope';
/**
 * 取引数redisアダプター
 *
 * @class TransactionCountAdapter
 */
export default class TransactionCountAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisClient: redis.RedisClient);
    static SCOPE2KEY(scope: TransactionScopeFactory.ITransactionScope): string;
    incr(scope: TransactionScopeFactory.ITransactionScope): Promise<number>;
    getByScope(scope: TransactionScopeFactory.ITransactionScope): Promise<number>;
}
