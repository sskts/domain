import * as createDebug from 'debug';
import * as redis from 'redis';
import * as url from 'url';

const debug = createDebug('sskts-domain:adapter:performanceAvailability');
const REDIS_KEY = 'sskts-performance-avalilabilities';
// const TIMEOUT_IN_SECONDS = 300;

export interface IAvailabilitiesByPerformanceId {
    [performanceId: string]: string;
}

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
            tls: false,
            return_buffers: false
        };
        if (parsedUrl.port === '6380') {
            options.tls = { servername: parsedUrl.hostname };
        }

        this.redisClient = redis.createClient(options);
    }

    public async findByPerformance(performanceId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // 劇場のパフォーマンス空席状況を取得
            this.redisClient.hget([REDIS_KEY, performanceId], (err, reply) => {
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                if (reply === null) {
                    reject(new Error('not found'));

                    return;
                }
                debug('reply:', reply);

                resolve(reply);
            });
        });
    }

    public async saveByPerformance(performanceId: string, availability: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // this.redisClient.expire([REDIS_KEY, TIMEOUT_IN_SECONDS], () => {
            this.redisClient.hset([REDIS_KEY, performanceId, availability], (err) => {
                console.error(err);
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            // });
        });
    }
}
