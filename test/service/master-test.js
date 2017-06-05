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
/**
 * マスターサービステスト
 *
 * @ignore
 */
const assert = require("assert");
const mongoose = require("mongoose");
const redis = require("redis");
const film_1 = require("../../lib/adapter/film");
const performance_1 = require("../../lib/adapter/performance");
const screen_1 = require("../../lib/adapter/screen");
const performance_2 = require("../../lib/adapter/stockStatus/performance");
const theater_1 = require("../../lib/adapter/theater");
const MasterService = require("../../lib/service/master");
let connection;
let redisClient;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
    // 全て削除してからテスト開始
    const theaterAdapter = new theater_1.default(connection);
    const screenAdapter = new screen_1.default(connection);
    const filmAdapter = new film_1.default(connection);
    const performanceAdapter = new performance_1.default(connection);
    yield theaterAdapter.model.remove({}).exec();
    yield screenAdapter.model.remove({}).exec();
    yield filmAdapter.model.remove({}).exec();
    yield performanceAdapter.model.remove({}).exec();
}));
describe('マスターサービス 劇場インポート', () => {
    it('存在しない劇場コードで失敗', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        try {
            yield MasterService.importTheater('000')(theaterAdapter);
        }
        catch (error) {
            assert(error instanceof Error);
            return;
        }
        throw new Error('should not be passed');
    }));
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        yield MasterService.importTheater('118')(theaterAdapter);
    }));
});
describe('マスターサービス スクリーンインポート', () => {
    it('劇場が存在しないので失敗', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        const screenAdapter = new screen_1.default(connection);
        try {
            yield MasterService.importScreens('000')(theaterAdapter, screenAdapter);
        }
        catch (error) {
            assert(error instanceof Error);
            return;
        }
        throw new Error('thenable');
    }));
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        const screenAdapter = new screen_1.default(connection);
        yield MasterService.importScreens('118')(theaterAdapter, screenAdapter);
    }));
});
describe('マスターサービス 作品インポート', () => {
    it('劇場が存在しないので失敗', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        const filmAdapter = new film_1.default(connection);
        try {
            yield MasterService.importFilms('000')(theaterAdapter, filmAdapter);
        }
        catch (error) {
            assert(error instanceof Error);
            return;
        }
        throw new Error('存在しないはず');
    }));
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        const filmAdapter = new film_1.default(connection);
        yield MasterService.importFilms('118')(theaterAdapter, filmAdapter);
    }));
});
describe('マスターサービス パフォーマンスインポート', () => {
    it('劇場が存在しないので失敗', () => __awaiter(this, void 0, void 0, function* () {
        const filmAdapter = new film_1.default(connection);
        const screenAdapter = new screen_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        try {
            yield MasterService.importPerformances('000', '20170401', '20170401')(filmAdapter, screenAdapter, performanceAdapter);
        }
        catch (error) {
            assert(error instanceof Error);
            return;
        }
        throw new Error('失敗するはず');
    }));
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const filmAdapter = new film_1.default(connection);
        const screenAdapter = new screen_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        yield MasterService.importPerformances('118', '20170401', '20170401')(filmAdapter, screenAdapter, performanceAdapter);
    }));
});
describe('マスターサービス 劇場取得', () => {
    it('存在する', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        const theaterOption = yield MasterService.findTheater('118')(theaterAdapter);
        assert(theaterOption.isDefined);
        assert.equal(theaterOption.get().id, '118');
    }));
    it('存在しない', () => __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = new theater_1.default(connection);
        const theaterOption = yield MasterService.findTheater('000')(theaterAdapter);
        assert(theaterOption.isEmpty);
    }));
});
describe('マスターサービス 作品取得', () => {
    it('存在する', () => __awaiter(this, void 0, void 0, function* () {
        const filmAdapter = new film_1.default(connection);
        const filmOption = yield MasterService.findFilm('118170620')(filmAdapter);
        assert(filmOption.isDefined);
        assert.equal(filmOption.get().id, '118170620');
    }));
    it('存在しない', () => __awaiter(this, void 0, void 0, function* () {
        const filmAdapter = new film_1.default(connection);
        const filmOption = yield MasterService.findFilm('000000000')(filmAdapter);
        assert(filmOption.isEmpty);
    }));
});
describe('マスターサービス パフォーマンス取得', () => {
    it('存在する', () => __awaiter(this, void 0, void 0, function* () {
        const performanceAdapter = new performance_1.default(connection);
        const performance = {
            id: '12345',
            day: '20170401',
            time_start: '0900',
            time_end: '1100',
            canceled: false
        };
        // tslint:disable-next-line:max-line-length
        const performanceDoc = yield performanceAdapter.model.findByIdAndUpdate(performance.id, performance, { new: true, upsert: true }).exec();
        const performanceOption = yield MasterService.findPerformance('12345')(performanceAdapter);
        assert(performanceOption.isDefined);
        assert.equal(performanceOption.get().id, '12345');
        yield performanceDoc.remove();
    }));
    it('存在しない', () => __awaiter(this, void 0, void 0, function* () {
        const performanceAdapter = new performance_1.default(connection);
        const performanceOption = yield MasterService.findPerformance('000')(performanceAdapter);
        assert(performanceOption.isEmpty);
    }));
});
describe('マスターサービス パフォーマンス検索', () => {
    it('searchPerformances by theater ok', () => __awaiter(this, void 0, void 0, function* () {
        const performanceAdapter = new performance_1.default(connection);
        const performanceStockStatusAdapter = new performance_2.default(redisClient);
        const performances = yield MasterService.searchPerformances({ theater: '118' })(performanceAdapter, performanceStockStatusAdapter);
        performances.map((performance) => {
            assert.equal(performance.theater.id, '118');
        });
    }));
    it('searchPerformances by day ok', () => __awaiter(this, void 0, void 0, function* () {
        const performanceAdapter = new performance_1.default(connection);
        const performanceStockStatusAdapter = new performance_2.default(redisClient);
        const performances = yield MasterService.searchPerformances({ day: '20170301' })(performanceAdapter, performanceStockStatusAdapter);
        performances.map((performance) => {
            assert.equal(performance.day, '20170301');
        });
    }));
});
