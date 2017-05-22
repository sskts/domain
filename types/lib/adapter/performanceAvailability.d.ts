import * as redis from 'redis';
import * as PerformanceAvailabilityFactory from '../factory/performanceAvailability';
/**
 * パフォーマンス空席状況アダプター
 * todo jsdoc
 *
 * @class PerformanceAvailabilityAdapter
 */
export default class PerformanceAvailabilityAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisUrl: string);
    findByPerformance(performanceDay: string, performanceId: string): Promise<string>;
    saveByPerformance(performanceDay: string, performanceId: string, availability: PerformanceAvailabilityFactory.Availability): Promise<void>;
    removeByPerformaceDay(performanceDay: string): Promise<void>;
    setTTLIfNotExist(key: string): Promise<void>;
}
