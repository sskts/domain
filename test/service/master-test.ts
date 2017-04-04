/**
 * マスターサービステスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as mongoose from 'mongoose';

import FilmAdapter from '../../lib/adapter/film';
import PerformanceAdapter from '../../lib/adapter/performance';
import ScreenAdapter from '../../lib/adapter/screen';
import TheaterAdapter from '../../lib/adapter/theater';

import * as PerformanceFactory from '../../lib/factory/performance';

import * as MasterService from '../../lib/service/master';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

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
            await MasterService.importTheater('000')(theaterAdapter);
        } catch (error) {
            assert(error instanceof Error);
            return;
        }

        throw new Error('should not be passed');
    });

    it('成功', (done) => {
        const theaterAdapter = new TheaterAdapter(connection);
        MasterService.importTheater('118')(theaterAdapter)
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});

describe('マスターサービス スクリーンインポート', () => {
    it('劇場が存在しないので失敗', (done) => {
        const theaterAdapter = new TheaterAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        MasterService.importScreens('000')(
            theaterAdapter,
            screenAdapter
        )
            .then(() => {
                done(new Error('thenable.'));
            })
            .catch(() => {
                done();
            });
    });

    it('成功', (done) => {
        const theaterAdapter = new TheaterAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        MasterService.importScreens('118')(
            theaterAdapter,
            screenAdapter
        )
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});

describe('マスターサービス 作品インポート', () => {
    it('劇場が存在しないので失敗', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const filmAdapter = new FilmAdapter(connection);

        try {
            await MasterService.importFilms('000')(theaterAdapter, filmAdapter);
        } catch (error) {
            assert(error instanceof Error);
            return;
        }

        throw new Error('存在しないはず');
    });

    it('成功', async () => {
        const theaterAdapter = new TheaterAdapter(connection);
        const filmAdapter = new FilmAdapter(connection);

        await MasterService.importFilms('118')(theaterAdapter, filmAdapter);
    });
});

describe('マスターサービス パフォーマンスインポート', () => {
    it('劇場が存在しないので失敗', async () => {
        const filmAdapter = new FilmAdapter(connection);
        const screenAdapter = new ScreenAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        try {
            await MasterService.importPerformances('000', '20170401', '20170401')(
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

        await MasterService.importPerformances('118', '20170401', '20170401')(
            filmAdapter,
            screenAdapter,
            performanceAdapter
        );
    });
});

describe('マスターサービス 劇場取得', () => {
    it('存在する', async () => {
        const theaterAdapter = new TheaterAdapter(connection);

        const theaterOption = await MasterService.findTheater('118')(theaterAdapter);
        assert(theaterOption.isDefined);
        assert.equal(theaterOption.get().id, '118');
    });

    it('存在しない', async () => {
        const theaterAdapter = new TheaterAdapter(connection);

        const theaterOption = await MasterService.findTheater('000')(theaterAdapter);
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
    // todo 特定のパフォーマンスコードでしかテスト通らない
    it('存在する', async () => {
        const performanceAdapter = new PerformanceAdapter(connection);
        const performance: PerformanceFactory.IPerformanceBase = {
            id: '12345',
            day: '20170401',
            time_start: '0900',
            time_end: '1100',
            canceled: false
        };
        const performanceDoc = await performanceAdapter.model.findByIdAndUpdate(performance.id, performance, { new: true, upsert: true });

        const performanceOption = await MasterService.findPerformance('12345')(performanceAdapter)
        assert(performanceOption.isDefined);
        assert.equal(performanceOption.get().id, '12345');

        await performanceDoc.remove();
    });

    it('存在しない', async () => {
        const performanceAdapter = new PerformanceAdapter(connection);
        const performanceOption = await MasterService.findPerformance('000')(performanceAdapter);
        assert(performanceOption.isEmpty);
    });
});


describe('マスターサービス パフォーマンス検索', () => {
    it('searchPerformances by theater ok', (done) => {
        const performanceAdapter = new PerformanceAdapter(connection);
        MasterService.searchPerformances({ theater: '118' })(performanceAdapter)
            .then((performances) => {
                performances.map((performance) => {
                    assert.equal(performance.theater.id, '118');
                });

                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('searchPerformances by day ok', (done) => {
        const performanceAdapter = new PerformanceAdapter(connection);
        MasterService.searchPerformances({ day: '20170301' })(performanceAdapter)
            .then((performances) => {
                performances.map((performance) => {
                    assert.equal(performance.day, '20170301');
                });

                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
