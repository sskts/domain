import * as createDebug from 'debug';
import * as redis from 'redis';

const debug = createDebug('sskts-domain:repository:action:registerInProgress');

/**
 * 進行アクションキーインターフェース
 */
export interface IProgressKey {
    membershipNumber: string;
    programMembershipId: string;
}

/**
 * 進行中の会員プログラム登録アクションリポジトリー
 */
export class RedisRepository {
    public static KEY_PREFIX: string = 'sskts-domain:registerProgramMembershipActionInProgress';
    public readonly redisClient: redis.RedisClient;

    constructor(redisClient: redis.RedisClient) {
        this.redisClient = redisClient;
    }

    /**
     * ロックする
     */
    public async lock(progressKey: IProgressKey, actionId: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const key = `${RedisRepository.KEY_PREFIX}:${progressKey.membershipNumber}:${progressKey.programMembershipId}`;
            const ttl = 7200;
            debug('locking...', key, ttl);
            this.redisClient.multi()
                .setnx(key, actionId, debug)
                .expire(key, ttl, debug)
                .exec((err, results) => {
                    debug('results:', results);
                    if (err !== null) {
                        reject(err);
                    } else {
                        if (results[0] === 1) {
                            resolve();
                        } else {
                            reject(new Error('Already in progress.'));
                        }
                    }
                });
        });
    }

    public async unlock(progressKey: IProgressKey) {
        return new Promise<void>((resolve, reject) => {
            const key = `${RedisRepository.KEY_PREFIX}:${progressKey.membershipNumber}:${progressKey.programMembershipId}`;
            this.redisClient.del([key], (err, res) => {
                debug(err, res);
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
