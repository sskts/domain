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
const debug = createDebug('sskts-domain:adapter:performanceAvailability');
const REDIS_KEY_PREFIX = 'sskts-performance-avalilabilities';
const TIMEOUT_IN_SECONDS = 864000;
/**
 * パフォーマンス空席状況アダプター
 * todo jsdoc
 *
 * @class PerformanceAvailabilityAdapter
 */
class PerformanceAvailabilityAdapter {
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
    findByPerformance(performanceDay, performanceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${REDIS_KEY_PREFIX}:${performanceDay}`;
            return new Promise((resolve, reject) => {
                // 劇場のパフォーマンス空席状況を取得
                this.redisClient.hget([key, performanceId], (err, res) => {
                    debug('reply:', res);
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    resolve((res === null) ? '' : res);
                });
            });
        });
    }
    saveByPerformance(performanceDay, performanceId, availability) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${REDIS_KEY_PREFIX}:${performanceDay}`;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.redisClient.hset([key, performanceId, availability], (err) => {
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
    removeByPerformaceDay(performanceDay) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${REDIS_KEY_PREFIX}:${performanceDay}`;
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
    setTTLIfNotExist(key) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    // 値を初期化して、期限セット
                    // 初期化のための値は、パフォーマンス情報に影響がなければ、実際なんでもいい
                    debug('expire...');
                    this.redisClient.expire([key, TIMEOUT_IN_SECONDS], () => {
                        resolve();
                    });
                });
            });
        });
    }
}
exports.default = PerformanceAvailabilityAdapter;
