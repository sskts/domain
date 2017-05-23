/**
 * 在庫サービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import FilmAdapter from '../../lib/adapter/film';
import PerformanceAdapter from '../../lib/adapter/performance';
import ScreenAdapter from '../../lib/adapter/screen';
import PerformanceStockStatusAdapter from '../../lib/adapter/stockStatus/performance';
import TheaterAdapter from '../../lib/adapter/theater';

import * as MasterService from '../../lib/service/master';
import * as StockStatusService from '../../lib/service/stockStatus';

describe('在庫状況サービス パフォーマンス在庫状況更新', () => {
    const theaterId = '118';
    const performanceDayStart = moment().format('YYYYMMDD');
    const performanceDayEnd = performanceDayStart;

    let connection: mongoose.Connection;
    before(async () => {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);

        // 全て削除してからテスト開始
        const performanceAdapter = new PerformanceAdapter(connection);
        const performanceStockStatusAdapter = new PerformanceStockStatusAdapter(process.env.TEST_REDIS_URL);

        await performanceAdapter.model.remove({}).exec();
        await performanceStockStatusAdapter.removeByPerformaceDay(performanceDayStart);
    });

    it('ok', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        const filmAdapter = new FilmAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);
        const performanceStockStatusAdapter = new PerformanceStockStatusAdapter(process.env.TEST_REDIS_URL);

        // テストマスターデータをインポート
        await MasterService.importTheater(theaterId)(theaterAdapter);
        await MasterService.importScreens(theaterId)(theaterAdapter, screenAdapter);
        await MasterService.importFilms(theaterId)(theaterAdapter, filmAdapter);
        await MasterService.importPerformances(theaterId, performanceDayStart, performanceDayEnd)(
            filmAdapter, screenAdapter, performanceAdapter
        );

        // パフォーマンスをひとつ取得
        const performanceDoc = await performanceAdapter.model.findOne({ day: performanceDayStart }).exec();
        assert(performanceDoc !== null);

        // まずは在庫状況存在しないはず
        let stockStatus: any;
        stockStatus = await performanceStockStatusAdapter.findOne(performanceDayStart, performanceDoc.get('id'));
        assert.equal(stockStatus, null);

        // 在庫状況を更新
        await StockStatusService.updatePerformanceStockStatuses(theaterId, performanceDayStart, performanceDayEnd)(
            performanceStockStatusAdapter
        );

        // 在庫状況存在するはず
        stockStatus = await performanceStockStatusAdapter.findOne(performanceDayStart, performanceDoc.get('id'));
        assert.notEqual(stockStatus, null);

        // テストデータ削除
        await performanceAdapter.model.remove({}).exec();
    });
});