import * as createDebug from 'debug';
import * as redis from 'redis';
import * as url from 'url';

import * as PerformanceStockStatusFactory from '../../factory/stockStatus/performance';

const debug = createDebug('sskts-domain:adapter:stockStatus:performance');
const REDIS_KEY_PREFIX = 'sskts-domain:stockStatus:performance';
const TIMEOUT_IN_SECONDS = 864000;

/**
 * パフォーマンス在庫状況アダプター
 * todo jsdoc
 * todo IStockStatusAdapterをimplements
 *
 * @class PerformanceStockStatusAdapter
 */
export default class PerformanceStockStatusAdapter {
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

    /**
     * パフォーマンス上映日からredisキーを生成する
     *
     * @static
     * @param {string} performanceDay 上映日
     * @returns {string} redis key
     *
     * @memberof PerformanceStockStatusAdapter
     */
    public static CREATE_REDIS_KEY(performanceDay: string): string {
        return `${REDIS_KEY_PREFIX}:${performanceDay}`;
    }

    /**
     * 在庫状況をひとつ取得する
     *
     * @param {string} performanceDay 上映日
     * @param {string} performanceId パフォーマンスID
     * @returns {(Promise<PerformanceStockStatusFactory.IPerformanceStockStatus | null>)}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    public async findOne(performanceDay: string, performanceId: string):
        Promise<PerformanceStockStatusFactory.IPerformanceStockStatus | null> {
        const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);

        return new Promise<PerformanceStockStatusFactory.IPerformanceStockStatus | null>((resolve, reject) => {
            // 劇場のパフォーマンス空席状況を取得
            this.redisClient.hget([key, performanceId], (err, res) => {
                debug('reply:', res);
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                // 存在しなければすぐ返却
                if (res === null) {
                    resolve(res);

                    return;
                }

                const stockStatus = PerformanceStockStatusFactory.create({
                    performaceId: performanceId,
                    expression: res
                });
                resolve(stockStatus);
            });
        });
    }

    /**
     * 在庫状況をひとつ更新する
     *
     * @param {string} performanceDay 上映日
     * @param {string} performanceId パフォーマンスID
     * @param {PerformanceStockStatusFactory.Expression} expression 在庫状況表現
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    public async updateOne(
        performanceDay: string,
        performanceId: string,
        expression: PerformanceStockStatusFactory.Expression
    ): Promise<void> {
        const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);

        return new Promise<void>(async (resolve, reject) => {
            this.redisClient.hset([key, performanceId, expression], (err) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * 上映日から在庫状況を削除する
     *
     * @param {string} performanceDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    public async removeByPerformaceDay(performanceDay: string): Promise<void> {
        const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);

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

    /**
     * 上映日からredis cacheに期限をセットする
     *
     * @param {string} performanceDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    public async setTTLIfNotExist(performanceDay: string): Promise<void> {
        const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);

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

                // 期限セット
                this.redisClient.expire([key, TIMEOUT_IN_SECONDS], () => {
                    resolve();
                });
            });
        });
    }
}
