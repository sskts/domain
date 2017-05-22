import * as createDebug from 'debug';
import * as redis from 'redis';
import * as url from 'url';

const debug = createDebug('sskts-domain:adapter:performanceAvailability');
const REDIS_KEY_PREFIX = 'sskts-performance-avalilabilities';
const TIMEOUT_IN_SECONDS = 864000;

/**
 * パフォーマンス空席状況アダプター
 *
 * @class PerformanceAvailabilityAdapter
 */
export default class PerformanceAvailabilityAdapter {
    public readonly redisClient: redis.RedisClient;

    constructor(redisUrl: string) {
        const parsedUrl = url.parse(redisUrl);
        const options: redis.ClientOpts = {
            url: redisUrl,
            return_buffers: false
        };
        // SSL対応の場合
        if (parsedUrl.port === '6380') {
            options.tls = { servername: parsedUrl.hostname };
        }

        this.redisClient = redis.createClient(options);
    }

    public async findByPerformance(performanceDay: string, performanceId: string): Promise<string> {
        const key = `${REDIS_KEY_PREFIX}:${performanceDay}`;

        return new Promise<string>((resolve, reject) => {
            // 劇場のパフォーマンス空席状況を取得
            this.redisClient.hget([key, performanceId], (err, res) => {
                debug('reply:', res);
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                resolve((res === null) ? '' : res);
            });
        });
    }

    public async saveByPerformance(performanceDay: string, performanceId: string, availability: string): Promise<void> {
        const key = `${REDIS_KEY_PREFIX}:${performanceDay}`;

        return new Promise<void>(async (resolve, reject) => {
            this.redisClient.hset([key, performanceId, availability], (err) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async removeByPerformaceDay(performanceDay: string): Promise<void> {
        const key = `${REDIS_KEY_PREFIX}:${performanceDay}`;

        return new Promise<void>(async (resolve, reject) => {
            this.redisClient.del([key], (err) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async setTTLIfNotExist(key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.ttl([key], (err, ttl) => {
                debug('ttl:', ttl);
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                // 存在していれば何もしない
                if (ttl > -1) {
                    resolve();

                    return;
                }

                // 値を初期化して、期限セット
                // 初期化のための値は、パフォーマンス情報に影響がなければ、実際なんでもいい
                debug('expire...');
                this.redisClient.expire([key, TIMEOUT_IN_SECONDS], () => {
                    resolve();
                });
            });
        });
    }
}
