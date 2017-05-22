import * as redis from 'redis';
import * as PerformanceStockStatusFactory from '../../factory/stockStatus/performance';
/**
 * パフォーマンス在庫状況アダプター
 * todo jsdoc
 * todo IStockStatusAdapterをimplements
 *
 * @class PerformanceStockStatusAdapter
 */
export default class PerformanceStockStatusAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisUrl: string);
    findByPerformance(performanceDay: string, performanceId: string): Promise<PerformanceStockStatusFactory.IPerformanceStockStatus | null>;
    saveByPerformance(performanceDay: string, performanceId: string, availability: PerformanceStockStatusFactory.IPerformanceStockStatus): Promise<void>;
    removeByPerformaceDay(performanceDay: string): Promise<void>;
    setTTLIfNotExist(key: string): Promise<void>;
}
