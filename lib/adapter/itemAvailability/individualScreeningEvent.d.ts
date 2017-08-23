import * as factory from '@motionpicture/sskts-factory';
import * as redis from 'redis';
/**
 * パフォーマンス在庫状況アダプター
 * @class IndividualScreeningEventItemAvailabilityAdapter
 */
export default class IndividualScreeningEventItemAvailabilityAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisClient: redis.RedisClient);
    /**
     * パフォーマンス上映日からredisキーを生成する
     *
     * @static
     * @param {string} screeningDay 上映日
     * @returns {string} redis key
     *
     * @memberof IndividualScreeningEventItemAvailabilityAdapter
     */
    static CREATE_REDIS_KEY(screeningDay: string): string;
    /**
     * 在庫状況をひとつ取得する
     *
     * @param {string} screeningDay 上映日
     * @param {string} eventIdentifier パフォーマンスID
     * @returns {(Promise<factory.event.individualScreeningEvent.ItemAvailability | null>)}
     *
     * @memberof IndividualScreeningEventItemAvailabilityAdapter
     */
    findOne(screeningDay: string, eventIdentifier: string): Promise<factory.event.individualScreeningEvent.IItemAvailability | null>;
    /**
     * 在庫状況をひとつ更新する
     *
     * @param {string} screeningDay 上映日
     * @param {string} eventIdentifier パフォーマンスID
     * @param {factory.event.individualScreeningEvent.IItemAvailability} itemAvailability 在庫状況表現
     * @returns {Promise<void>}
     *
     * @memberof IndividualScreeningEventItemAvailabilityAdapter
     */
    updateOne(screeningDay: string, eventIdentifier: string, itemAvailability: factory.event.individualScreeningEvent.IItemAvailability): Promise<void>;
    /**
     * 上映日から在庫状況を削除する
     *
     * @param {string} screeningDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof IndividualScreeningEventItemAvailabilityAdapter
     */
    removeByPerformaceDay(screeningDay: string): Promise<void>;
    /**
     * 上映日からredis cacheに期限をセットする
     *
     * @param {string} screeningDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof IndividualScreeningEventItemAvailabilityAdapter
     */
    setTTLIfNotExist(screeningDay: string): Promise<void>;
}
