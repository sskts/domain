/**
 * マスターサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as redis from 'redis';

import FilmAdapter from '../../lib/adapter/film';
import PerformanceAdapter from '../../lib/adapter/performance';
import ScreenAdapter from '../../lib/adapter/screen';
import PerformanceStockStatusAdapter from '../../lib/adapter/stockStatus/performance';
import TheaterAdapter from '../../lib/adapter/theater';

import * as PerformanceFactory from '../../lib/factory/performance';

import * as MasterService from '../../lib/service/master';

const TEST_INVALID_THEATER_ID = '000';
const TEST_VALID_THEATER_ID = '118';
const TEST_PERFORMANCE_DAY = moment().format('YYYYMMDD');

let connection: mongoose.Connection;
let redisClient: redis.RedisClient;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    // 全て削除してからテスト開始
    const theaterAdapter = new TheaterAdapter(connection);
    const screenAdapter = new ScreenAdapter(connection);
    const filmAdapter = new FilmAdapter(connection);
    const performanceAdapter = new PerformanceAdapter(connection);

    await theaterAdapter.model.remove({}).exec();
    await screenAdapter.model.remove({}).exec();
    await filmAdapter.model.remove({}).exec();
    await performanceAdapter.model.remove({}).exec();
});

describe('マスターサービス 劇場インポート', () => {
    it('存在しない劇場コードで失敗', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        try {
            await MasterService.importTheater(TEST_INVALID_THEATER_ID)(theaterAdapter);
        } catch (error) {
            assert(error instanceof Error);

            return;
        }

        throw new Error('should not be passed');
    });

    it('成功', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        await MasterService.importTheater(TEST_VALID_THEATER_ID)(theaterAdapter);
    });
});

describe('マスターサービス スクリーンインポート', () => {
    it('劇場が存在しないので失敗', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        try {
            await MasterService.importScreens(TEST_INVALID_THEATER_ID)(
                theaterAdapter,
                screenAdapter
            );
        } catch (error) {
            assert(error instanceof Error);

            return;
        }

        throw new Error('thenable');
    });

    it('成功', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        await MasterService.importScreens(TEST_VALID_THEATER_ID)(theaterAdapter, screenAdapter);
    });
});

describe('マスターサービス 作品インポート', () => {
    it('劇場が存在しないので失敗', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const filmAdapter = new FilmAdapter(connection);

        try {
            await MasterService.importFilms(TEST_INVALID_THEATER_ID)(theaterAdapter, filmAdapter);
        } catch (error) {
            assert(error instanceof Error);

            return;
        }

        throw new Error('存在しないはず');
    });

    it('成功', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const filmAdapter = new FilmAdapter(connection);

        await MasterService.importFilms(TEST_VALID_THEATER_ID)(theaterAdapter, filmAdapter);
    });
});

describe('マスターサービス パフォーマンスインポート', () => {
    it('劇場が存在しないので失敗', async () => {
        const filmAdapter = new FilmAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        try {
            await MasterService.importPerformances(TEST_INVALID_THEATER_ID, TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_DAY)(
                filmAdapter,
                screenAdapter,
                performanceAdapter
            );
        } catch (error) {
            assert(error instanceof Error);

            return;
        }

        throw new Error('失敗するはず');
    });

    it('成功', async () => {
        const filmAdapter = new FilmAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        await MasterService.importPerformances(TEST_VALID_THEATER_ID, TEST_PERFORMANCE_DAY, TEST_PERFORMANCE_DAY)(
            filmAdapter,
            screenAdapter,
            performanceAdapter
        );
    });
});

describe('マスターサービス 劇場取得', () => {
    it('存在する', async () => {
        const theaterAdapter = new TheaterAdapter(connection);

        const theaterOption = await MasterService.findTheater(TEST_VALID_THEATER_ID)(theaterAdapter);
        assert(theaterOption.isDefined);
        assert.equal(theaterOption.get().id, TEST_VALID_THEATER_ID);
    });

    it('存在しない', async () => {
        const theaterAdapter = new TheaterAdapter(connection);

        const theaterOption = await MasterService.findTheater(TEST_INVALID_THEATER_ID)(theaterAdapter);
        assert(theaterOption.isEmpty);
    });
});

describe('マスターサービス 作品取得', () => {
    it('存在する', async () => {
        const filmAdapter = new FilmAdapter(connection);

        const filmOption = await MasterService.findFilm('118170620')(filmAdapter);
        assert(filmOption.isDefined);
        assert.equal(filmOption.get().id, '118170620');
    });

    it('存在しない', async () => {
        const filmAdapter = new FilmAdapter(connection);

        const filmOption = await MasterService.findFilm('000000000')(filmAdapter);
        assert(filmOption.isEmpty);
    });
});

describe('マスターサービス パフォーマンス取得', () => {
    it('存在する', async () => {
        const performanceAdapter = new PerformanceAdapter(connection);
        const performance: PerformanceFactory.IPerformanceBase = {
            id: '12345',
            day: TEST_PERFORMANCE_DAY,
            time_start: '0900',
            time_end: '1100',
            canceled: false
        };
        // tslint:disable-next-line:max-line-length
        const performanceDoc = await performanceAdapter.model.findByIdAndUpdate(performance.id, performance, { new: true, upsert: true }).exec();

        const performanceOption = await MasterService.findPerformance('12345')(performanceAdapter);
        assert(performanceOption.isDefined);
        assert.equal(performanceOption.get().id, '12345');

        await performanceDoc.remove();
    });

    it('存在しない', async () => {
        const performanceAdapter = new PerformanceAdapter(connection);
        const performanceOption = await MasterService.findPerformance(TEST_INVALID_THEATER_ID)(performanceAdapter);
        assert(performanceOption.isEmpty);
    });
});

describe('マスターサービス パフォーマンス検索', () => {
    it('劇場で検索できる', async () => {
        const performanceAdapter = new PerformanceAdapter(connection);
        const performanceStockStatusAdapter = new PerformanceStockStatusAdapter(redisClient);
        const performances = await MasterService.searchPerformances(
            { theater: TEST_VALID_THEATER_ID }
        )(performanceAdapter, performanceStockStatusAdapter);
        performances.map((performance) => {
            assert.equal(performance.theater.id, TEST_VALID_THEATER_ID);
        });
    });

    it('上映日で検索できる', async () => {
        const performanceAdapter = new PerformanceAdapter(connection);
        const performanceStockStatusAdapter = new PerformanceStockStatusAdapter(redisClient);
        const performances = await MasterService.searchPerformances({ day: TEST_PERFORMANCE_DAY })(
            performanceAdapter,
            performanceStockStatusAdapter
        );
        performances.map((performance) => {
            assert.equal(performance.day, TEST_PERFORMANCE_DAY);
        });
    });
});

describe('マスターサービス 劇場検索', () => {
    before(async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        await MasterService.importTheater(TEST_VALID_THEATER_ID)(theaterAdapter);
    });

    it('検索結果が適切な型', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const theaters = await MasterService.searchTheaters({})(theaterAdapter);

        assert(Array.isArray(theaters));
        assert(theaters.length > 0);
        theaters.map((theater) => {
            assert.equal(typeof theater.id, 'string');
            assert.equal(typeof theater.name, 'object');
            assert.equal(typeof theater.name_kana, 'string');
            assert.equal(typeof theater.address, 'object');
            assert(Array.isArray(theater.websites));
        });
    });
});
