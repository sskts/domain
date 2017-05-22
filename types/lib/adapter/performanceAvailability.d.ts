import * as redis from 'redis';
/**
 * パフォーマンス空席状況アダプター
 *
 * @class PerformanceAvailabilityAdapter
 */
export default class PerformanceAvailabilityAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisUrl: string);
    findByPerformance(performanceDay: string, performanceId: string): Promise<string>;
    saveByPerformance(performanceDay: string, performanceId: string, availability: string): Promise<void>;
    removeByPerformaceDay(performanceDay: string): Promise<void>;
    setTTLIfNotExist(key: string): Promise<void>;
}
