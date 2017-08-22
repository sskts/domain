import * as factory from '@motionpicture/sskts-factory';
import * as redis from 'redis';
/**
 * 取引数redisアダプター
 *
 * @class TransactionCountAdapter
 */
export default class TransactionCountAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisClient: redis.RedisClient);
    static SCOPE2KEY(scope: factory.transactionScope.ITransactionScope): string;
    incr(scope: factory.transactionScope.ITransactionScope): Promise<number>;
    getByScope(scope: factory.transactionScope.ITransactionScope): Promise<number>;
}
