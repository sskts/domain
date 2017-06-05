"use strict";
/**
 * パフォーマンス在庫状況アダプターテスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const redis = require("redis");
const performance_1 = require("../../../lib/adapter/stockStatus/performance");
const TEST_PERFORMANCE_DAY = '20170428';
const TEST_PERFORMANCE_ID = '1234567890';
let redisClient;
before(() => __awaiter(this, void 0, void 0, function* () {
    if (typeof process.env.TEST_REDIS_HOST !== 'string') {
        throw new Error('environment variable TEST_REDIS_HOST required');
    }
    if (typeof process.env.TEST_REDIS_PORT !== 'string') {
        throw new Error('environment variable TEST_REDIS_PORT required');
    }
    if (typeof process.env.TEST_REDIS_KEY !== 'string') {
        throw new Error('environment variable TEST_REDIS_KEY required');
    }
    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        // port: 6379,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
}));
describe('パフォーマンス空席状況アダプター パフォーマンスIDで検索', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // 全て削除してからテスト開始
        const adapter = new performance_1.default(redisClient);
        yield adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    }));
    it('redis接続されたらエラー', () => __awaiter(this, void 0, void 0, function* () {
        const client = redisClient.duplicate();
        const adapter = new performance_1.default(client);
        yield Promise.all([new Promise((resolve, reject) => {
                // 接続切断後に取得しようとしてもエラーになるはず
                client.quit(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
                    }
                    catch (error) {
                        resolve();
                        return;
                    }
                    reject('should not be passed');
                }));
            })]);
    }));
});
describe('パフォーマンス空席状況アダプター パフォーマンスIDで保管', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // 全て削除してからテスト開始
        const adapter = new performance_1.default(redisClient);
        yield adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const client = redisClient.duplicate();
        const adapter = new performance_1.default(client);
        let stockStatusFromRedis;
        stockStatusFromRedis = yield adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);
        // テストデータ生成
        const expression = '○';
        yield adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);
        stockStatusFromRedis = yield adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis.expression, expression);
    }));
    it('redis接続されたらエラー', () => __awaiter(this, void 0, void 0, function* () {
        const client = redisClient.duplicate();
        const adapter = new performance_1.default(client);
        yield new Promise((resolve, reject) => {
            // 接続切断後に更新しようとしてもエラーになるはず
            client.quit(() => __awaiter(this, void 0, void 0, function* () {
                // テストデータ生成
                const expression = '○';
                try {
                    yield adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);
                }
                catch (error) {
                    resolve();
                    return;
                }
                reject('should not be passed');
            }));
        });
    }));
});
describe('パフォーマンス空席状況アダプター 上映日から期限セット', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // 全て削除してからテスト開始
        const adapter = new performance_1.default(redisClient);
        yield adapter.removeByPerformaceDay(TEST_PERFORMANCE_DAY);
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const client = redisClient.duplicate();
        const adapter = new performance_1.default(client);
        const stockStatusFromRedis = yield adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);
        const key = performance_1.default.CREATE_REDIS_KEY(TEST_PERFORMANCE_DAY);
        yield new Promise((resolve, reject) => {
            adapter.redisClient.ttl([key], (err1, ttlBefore) => __awaiter(this, void 0, void 0, function* () {
                if (err1 instanceof Error) {
                    reject(err1);
                    return;
                }
                try {
                    assert(ttlBefore < 0);
                    // テストデータ生成
                    const expression = '○';
                    yield adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);
                    // 期限セット
                    yield adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);
                    // 期限セットされているはず
                    adapter.redisClient.ttl([key], (err2, ttlAfter) => __awaiter(this, void 0, void 0, function* () {
                        if (err2 instanceof Error) {
                            reject(err2);
                            return;
                        }
                        try {
                            assert(ttlAfter > 0);
                            resolve();
                        }
                        catch (error) {
                            reject(error);
                        }
                    }));
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }));
    it('redis接続されたらエラー', () => __awaiter(this, void 0, void 0, function* () {
        const client = redisClient.duplicate();
        const adapter = new performance_1.default(client);
        yield new Promise((resolve, reject) => {
            // 接続切断後に更新しようとしてもエラーになるはず
            client.quit(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);
                }
                catch (error) {
                    resolve();
                    return;
                }
                reject('should not be passed');
            }));
        });
    }));
    it('期限セット済みであれば何もしない', () => __awaiter(this, void 0, void 0, function* () {
        const client = redisClient.duplicate();
        const adapter = new performance_1.default(client);
        const TIMEOUT_IN_SECONDS = 3600;
        const stockStatusFromRedis = yield adapter.findOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID);
        assert.equal(stockStatusFromRedis, null);
        const key = performance_1.default.CREATE_REDIS_KEY(TEST_PERFORMANCE_DAY);
        // テストデータ生成
        const expression = '○';
        yield adapter.updateOne(TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_ID, expression);
        yield new Promise((resolve, reject) => {
            adapter.redisClient.expire([key, TIMEOUT_IN_SECONDS], () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // 期限セット
                    yield adapter.setTTLIfNotExist(TEST_PERFORMANCE_DAY);
                    // 期限セットされているはず
                    adapter.redisClient.ttl([key], (err2, ttlAfter) => __awaiter(this, void 0, void 0, function* () {
                        if (err2 instanceof Error) {
                            reject(err2);
                            return;
                        }
                        try {
                            assert(ttlAfter > 0);
                            resolve();
                        }
                        catch (error) {
                            reject(error);
                        }
                    }));
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }));
});
