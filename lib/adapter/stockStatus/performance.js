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
const redis = require("redis");
const url = require("url");
const PerformanceStockStatusFactory = require("../../factory/stockStatus/performance");
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
class PerformanceStockStatusAdapter {
    constructor(redisUrl) {
        const parsedUrl = url.parse(redisUrl);
        const options = {
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
    static CREATE_REDIS_KEY(performanceDay) {
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
    findOne(performanceDay, performanceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);
            return new Promise((resolve, reject) => {
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
    updateOne(performanceDay, performanceId, expression) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.redisClient.hset([key, performanceId, expression], (err) => {
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
     * @param {string} performanceDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    removeByPerformaceDay(performanceDay) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.redisClient.del([key], (err) => {
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
     * @param {string} performanceDay 上映日
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    setTTLIfNotExist(performanceDay) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);
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
exports.default = PerformanceStockStatusAdapter;
