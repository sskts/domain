"use strict";
/**
 * 取引数アダプターテスト
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
const moment = require("moment");
const redis = require("redis");
const transactionCount_1 = require("../../lib/adapter/transactionCount");
const TransactionScopeFactory = require("../../lib/factory/transactionScope");
const TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS = 60;
let TEST_TRANSACTION_SCOPE;
let redisClient;
function createRedisClient() {
    return redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
}
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
    const readyFrom = moment();
    const readyUntil = moment(readyFrom).add(TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS, 'seconds');
    TEST_TRANSACTION_SCOPE = TransactionScopeFactory.create({
        ready_from: readyFrom.toDate(),
        ready_until: readyUntil.toDate()
    });
}));
describe('取引数アダプター カウントアップ', () => {
    beforeEach(() => {
        redisClient = createRedisClient();
    });
    it('カウントアップの前後で差が1のはず', () => __awaiter(this, void 0, void 0, function* () {
        const transactionCountAdapter = new transactionCount_1.default(redisClient);
        const countBefore = yield transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE);
        yield transactionCountAdapter.incr(TEST_TRANSACTION_SCOPE);
        const countAfter = yield transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE);
        assert.equal(countAfter, countBefore + 1);
    }));
    it('redis接続切断されたらエラー', () => __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => {
            redisClient.quit(() => __awaiter(this, void 0, void 0, function* () {
                const transactionCountAdapter = new transactionCount_1.default(redisClient);
                const getError = yield transactionCountAdapter.incr(TEST_TRANSACTION_SCOPE)
                    .catch((error) => {
                    return error;
                });
                assert(getError instanceof Error);
                resolve();
            }));
        });
    }));
});
describe('取引数アダプター スコープからカウント取得', () => {
    beforeEach(() => {
        redisClient = createRedisClient();
    });
    it('カウントアップの前後で差が1のはず', () => __awaiter(this, void 0, void 0, function* () {
        const transactionCountAdapter = new transactionCount_1.default(redisClient);
        const count = yield transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE);
        assert.equal(typeof count, 'number');
    }));
    it('redis接続切断されたらエラー', () => __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => {
            redisClient.quit(() => __awaiter(this, void 0, void 0, function* () {
                const transactionCountAdapter = new transactionCount_1.default(redisClient);
                const getError = yield transactionCountAdapter.getByScope(TEST_TRANSACTION_SCOPE)
                    .catch((error) => {
                    return error;
                });
                assert(getError instanceof Error);
                resolve();
            }));
        });
    }));
});
