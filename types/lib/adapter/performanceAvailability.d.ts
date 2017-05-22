import * as redis from 'redis';
export interface IAvailabilitiesByPerformanceId {
    [performanceId: string]: string;
}
/**
 * パフォーマンス空席状況アダプター
 *
 * @class PerformanceAvailabilityAdapter
 */
export default class PerformanceAvailabilityAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisUrl: string);
    findByPerformance(performanceId: string): Promise<string>;
    saveByPerformance(performanceId: string, availability: string): Promise<void>;
}
