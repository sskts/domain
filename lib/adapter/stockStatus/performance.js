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
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:adapter:stockStatus:performance');
const REDIS_KEY_PREFIX = 'sskts-domain:stockStatus:performance';
const TIMEOUT_IN_SECONDS = 864000; // todo 調整？
/**
 * パフォーマンス在庫状況アダプター
 * todo jsdoc
 * todo IStockStatusAdapterをimplements?
 *
 * @class PerformanceStockStatusAdapter
 */
class PerformanceStockStatusAdapter {
    constructor(redisClient) {
        this.redisClient = redisClient;
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
     * @returns {(Promise<factory.stockStatus.performance.IStockStatus | null>)}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    findOne(performanceDay, performanceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);
            return new Promise((resolve, reject) => {
                // 劇場のパフォーマンス空席状況を取得
                this.redisClient.hget([key, performanceId], (err, res) => {
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
                    const expression = parseInt((res instanceof Buffer) ? res.toString() : res, 10);
                    const stockStatus = factory.stockStatus.performance.create({
                        performaceId: performanceId,
                        expression: expression
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
     * @param {factory.stockStatus.performance.Expression} expression 在庫状況表現
     * @returns {Promise<void>}
     *
     * @memberof PerformanceStockStatusAdapter
     */
    updateOne(performanceDay, performanceId, expression) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = PerformanceStockStatusAdapter.CREATE_REDIS_KEY(performanceDay);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.redisClient.hset([key, performanceId, expression], (err) => {
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
