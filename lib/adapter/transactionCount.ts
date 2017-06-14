import * as createDebug from 'debug';
import * as redis from 'redis';

import * as TransactionScopeFactory from '../factory/transactionScope';

const debug = createDebug('sskts-domain:adapter:transactionCount');

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

    public static SCOPE2KEY(scope: TransactionScopeFactory.ITransactionScope): string {
        return `${TransactionCountAdapter.KEY_PREFIX}:${TransactionScopeFactory.scope2String(scope)}`;
    }

    public async incr(scope: TransactionScopeFactory.ITransactionScope) {
        return new Promise<number>((resolve, reject) => {
            // redisでカウントアップ
            // ここで本来expireコマンドもセットしないと不要なデータが残ってしまうが、
            // 少しでもパフォーマンスを上げるために、不要なデータの削除は別タスクで行う想定
            const key = TransactionCountAdapter.SCOPE2KEY(scope);
            this.redisClient.incr([key], (err, replies) => {
                debug('incr:', err, replies);
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                // カウント単位あたりの取引最大数を超過しているかどうか
                // tslint:disable-next-line:no-magic-numbers
                resolve(parseInt(replies, 10));
            });
        });
    }

    public async getByScope(scope: TransactionScopeFactory.ITransactionScope) {
        return new Promise<number>((resolve, reject) => {
            const key = TransactionCountAdapter.SCOPE2KEY(scope);
            this.redisClient.get([key], (err, replies) => {
                debug(`get ${key}`, err, replies);
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                // tslint:disable-next-line:no-magic-numbers
                const numberOfTransactions = (replies !== null) ? parseInt(replies, 10) : 0;
                resolve(numberOfTransactions);
            });
        });
    }
}
