"use strict";
/**
 * 在庫サービステスト
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
const mongoose = require("mongoose");
const redis = require("redis");
const film_1 = require("../../lib/adapter/film");
const performance_1 = require("../../lib/adapter/performance");
const screen_1 = require("../../lib/adapter/screen");
const performance_2 = require("../../lib/adapter/stockStatus/performance");
const theater_1 = require("../../lib/adapter/theater");
const MasterService = require("../../lib/service/master");
const StockStatusService = require("../../lib/service/stockStatus");
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
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
}));
describe('在庫状況サービス パフォーマンス在庫状況更新', () => {
    const theaterId = '118';
    const performanceDayStart = moment().format('YYYYMMDD');
    const performanceDayEnd = performanceDayStart;
    let connection;
    before(() => __awaiter(this, void 0, void 0, function* () {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        // 全て削除してからテスト開始
        const performanceAdapter = new performance_1.default(connection);
        const performanceStockStatusAdapter = new performance_2.default(redisClient);
        yield performanceAdapter.model.remove({}).exec();
        yield performanceStockStatusAdapter.removeByPerformaceDay(performanceDayStart);
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        const screenAdapter = new screen_1.default(connection);
        const filmAdapter = new film_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const performanceStockStatusAdapter = new performance_2.default(redisClient);
        // テストマスターデータをインポート
        yield MasterService.importTheater(theaterId)(theaterAdapter);
        yield MasterService.importScreens(theaterId)(theaterAdapter, screenAdapter);
        yield MasterService.importFilms(theaterId)(theaterAdapter, filmAdapter);
        yield MasterService.importPerformances(theaterId, performanceDayStart, performanceDayEnd)(filmAdapter, screenAdapter, performanceAdapter);
        // パフォーマンスをひとつ取得
        const performanceDoc = yield performanceAdapter.model.findOne({ day: performanceDayStart }).exec();
        assert(performanceDoc !== null);
        // まずは在庫状況存在しないはず
        let stockStatus;
        stockStatus = yield performanceStockStatusAdapter.findOne(performanceDayStart, performanceDoc.get('id'));
        assert.equal(stockStatus, null);
        // 在庫状況を更新
        yield StockStatusService.updatePerformanceStockStatuses(theaterId, performanceDayStart, performanceDayEnd)(performanceStockStatusAdapter);
        // 在庫状況存在するはず
        stockStatus = yield performanceStockStatusAdapter.findOne(performanceDayStart, performanceDoc.get('id'));
        assert.notEqual(stockStatus, null);
        // テストデータ削除
        yield performanceAdapter.model.remove({}).exec();
    }));
});
