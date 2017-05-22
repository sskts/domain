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
const REDIS_KEY = 'sskts-performance-avalilabilities';
/**
 * パフォーマンス空席状況アダプター
 *
 * @class PerformanceAvailabilityAdapter
 */
class PerformanceAvailabilityAdapter {
    constructor(redisUrl) {
        const parsedUrl = url.parse(redisUrl);
        const options = {
            url: redisUrl,
            tls: false,
            return_buffers: false
        };
        if (parsedUrl.port === '6380') {
            options.tls = { servername: parsedUrl.hostname };
        }
        this.redisClient = redis.createClient(options);
    }
    findByPerformance(performanceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // 劇場のパフォーマンス空席状況を取得
                this.redisClient.hget([REDIS_KEY, performanceId], (err, reply) => {
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    if (reply === null) {
                        reject(new Error('not found'));
                        return;
                    }
                    debug('reply:', reply);
                    resolve(reply);
                });
            });
        });
    }
    saveByPerformance(performanceId, availability) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // this.redisClient.expire([REDIS_KEY, TIMEOUT_IN_SECONDS], () => {
                this.redisClient.hset([REDIS_KEY, performanceId, availability], (err) => {
                    console.error(err);
                    if (err instanceof Error) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
                // });
            });
        });
    }
}
exports.default = PerformanceAvailabilityAdapter;
