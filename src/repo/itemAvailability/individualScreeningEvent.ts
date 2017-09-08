import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as redis from 'redis';

const debug = createDebug('sskts-domain:repository:itemAvailability:individualScreeningEvent');
const REDIS_KEY_PREFIX = 'sskts-domain:itemAvailability:individualScreeningEvent';
// tslint:disable-next-line:no-suspicious-comment
// TODO 調整？
const TIMEOUT_IN_SECONDS = 864000;

/**
 * パフォーマンス在庫状況レポジトリー
 * @class IndividualScreeningEventItemAvailabilityRepository
 */
export class MongoRepository {
    public readonly redisClient: redis.RedisClient;

    constructor(redisClient: redis.RedisClient) {
        this.redisClient = redisClient;
    }

    /**
     * パフォーマンス上映日からredisキーを生成する
     *
     * @static
     * @param {string} screeningDay 上映日
     * @returns {string} redis key
     *
     * @memberof IndividualScreeningEventItemAvailabilityRepository
     */
    public static CREATE_REDIS_KEY(screeningDay: string): string {
        return `${REDIS_KEY_PREFIX}:${screeningDay}`;
    }

    /**
     * 在庫状況をひとつ取得する
     *
     * @param {string} screeningDay 上映日
     * @param {string} eventIdentifier パフォーマンスID
     * @returns {(Promise<factory.event.individualScreeningEvent.ItemAvailability | null>)}
     *
     * @memberof IndividualScreeningEventItemAvailabilityRepository
     */
    public async findOne(screeningDay: string, eventIdentifier: string):
        Promise<factory.event.individualScreeningEvent.IItemAvailability | null> {
        const key = MongoRepository.CREATE_REDIS_KEY(screeningDay);

        return new Promise<factory.event.individualScreeningEvent.IItemAvailability | null>((resolve, reject) => {
            // 劇場のパフォーマンス空席状況を取得
            this.redisClient.hget([key, eventIdentifier], (err, res) => {
                debug('hget processed.', err, res);
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                // 存在しなければすぐ返却
                if (res === null) {
                    resolve(res);

                    return;
                }

                // tslint:disable-next-line:no-magic-numbers
                const itemAvailability = parseInt((res instanceof Buffer) ? res.toString() : res, 10);
                resolve(itemAvailability);
            });
        });
    }

    /**
     * 在庫状況をひとつ更新する
     *
     * @param {string} screeningDay 上映日
     * @param {string} eventIdentifier パフォーマンスID
     * @param {factory.event.individualScreeningEvent.IItemAvailability} itemAvailability 在庫状況表現
     * @returns {Promise<void>}
     *
     * @memberof IndividualScreeningEventItemAvailabilityRepository
     */
    public async updateOne(
        screeningDay: string,
        eventIdentifier: string,
        itemAvailability: factory.event.individualScreeningEvent.IItemAvailability
    ): Promise<void> {
        const key = MongoRepository.CREATE_REDIS_KEY(screeningDay);

        return new Promise<void>(async (resolve, reject) => {
            this.redisClient.hset([key, eventIdentifier, itemAvailability], (err) => {
                debug('hset processed.', err);
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
     * @param {string} screeningDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof IndividualScreeningEventItemAvailabilityRepository
     */
    public async removeByPerformaceDay(screeningDay: string): Promise<void> {
        const key = MongoRepository.CREATE_REDIS_KEY(screeningDay);

        return new Promise<void>(async (resolve, reject) => {
            this.redisClient.del([key], (err) => {
                debug('del processed.', err);
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
     * @param {string} screeningDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof IndividualScreeningEventItemAvailabilityRepository
     */
    public async setTTLIfNotExist(screeningDay: string): Promise<void> {
        const key = MongoRepository.CREATE_REDIS_KEY(screeningDay);

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
                    debug('set expire.', key, TIMEOUT_IN_SECONDS);
                    resolve();
                });
            });
        });
    }
}
