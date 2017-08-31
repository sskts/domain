"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const debug = createDebug('sskts-domain:adapter:itemAvailability:individualScreeningEvent');
const REDIS_KEY_PREFIX = 'sskts-domain:itemAvailability:individualScreeningEvent';
// tslint:disable-next-line:no-suspicious-comment
// TODO 調整？
const TIMEOUT_IN_SECONDS = 864000;
/**
 * パフォーマンス在庫状況レポジトリー
 * @class IndividualScreeningEventItemAvailabilityRepository
 */
class IndividualScreeningEventItemAvailabilityRepository {
    constructor(redisClient) {
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
    static CREATE_REDIS_KEY(screeningDay) {
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
    findOne(screeningDay, eventIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = IndividualScreeningEventItemAvailabilityRepository.CREATE_REDIS_KEY(screeningDay);
            return new Promise((resolve, reject) => {
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
    updateOne(screeningDay, eventIdentifier, itemAvailability) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = IndividualScreeningEventItemAvailabilityRepository.CREATE_REDIS_KEY(screeningDay);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.redisClient.hset([key, eventIdentifier, itemAvailability], (err) => {
                    debug('hset processed.', err);
                    if (err instanceof Error) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
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
    removeByPerformaceDay(screeningDay) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = IndividualScreeningEventItemAvailabilityRepository.CREATE_REDIS_KEY(screeningDay);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.redisClient.del([key], (err) => {
                    debug('del processed.', err);
                    if (err instanceof Error) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
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
    setTTLIfNotExist(screeningDay) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = IndividualScreeningEventItemAvailabilityRepository.CREATE_REDIS_KEY(screeningDay);
            return new Promise((resolve, reject) => {
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
        });
    }
}
exports.default = IndividualScreeningEventItemAvailabilityRepository;
