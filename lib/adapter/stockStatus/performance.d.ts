import * as factory from '@motionpicture/sskts-factory';
import * as redis from 'redis';
/**
 * パフォーマンス在庫状況アダプター
 * todo jsdoc
 * todo IStockStatusAdapterをimplements?
 *
 * @class PerformanceStockStatusAdapter
 */
export default class PerformanceStockStatusAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisClient: redis.RedisClient);
    /**
     * パフォーマンス上映日からredisキーを生成する
     *
     * @static
     * @param {string} performanceDay 上映日
     * @returns {string} redis key
     *
     * @memberof PerformanceStockStatusAdapter
     */
    static CREATE_REDIS_KEY(performanceDay: string): string;
    /**
     * 在庫状況をひとつ取得する
     *
     * @param {string} performanceDay 上映日
     * @param {string} performanceId パフォーマンスID
     * @returns {(Promise<factory.stockStatus.performance.IStockStatus | null>)}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    findOne(performanceDay: string, performanceId: string): Promise<factory.stockStatus.performance.IStockStatus | null>;
    /**
     * 在庫状況をひとつ更新する
     *
     * @param {string} performanceDay 上映日
     * @param {string} performanceId パフォーマンスID
     * @param {factory.stockStatus.performance.Expression} expression 在庫状況表現
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    updateOne(performanceDay: string, performanceId: string, expression: factory.stockStatus.performance.Expression): Promise<void>;
    /**
     * 上映日から在庫状況を削除する
     *
     * @param {string} performanceDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    removeByPerformaceDay(performanceDay: string): Promise<void>;
    /**
     * 上映日からredis cacheに期限をセットする
     *
     * @param {string} performanceDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    setTTLIfNotExist(performanceDay: string): Promise<void>;
}
