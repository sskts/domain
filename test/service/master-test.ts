/**
 * マスターサービステスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('master service', () => {
    it('importTheater fail', (done) => {
        sskts.service.master.importTheater('000')(sskts.adapter.theater(connection))
            .then(() => {
                done(new Error('thenable.'));
            })
            .catch(() => {
                done();
            });
    });

    it('importTheater ok', (done) => {
        sskts.service.master.importTheater('118')(sskts.adapter.theater(connection))
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('importScreens fail', (done) => {
        sskts.service.master.importScreens('000')(
            sskts.adapter.theater(connection),
            sskts.adapter.screen(connection)
        )
            .then(() => {
                done(new Error('thenable.'));
            })
            .catch(() => {
                done();
            });
    });

    it('importScreens ok', (done) => {
        sskts.service.master.importScreens('118')(
            sskts.adapter.theater(connection),
            sskts.adapter.screen(connection)
        )
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('importFilms fail', (done) => {
        sskts.service.master.importFilms('000')(
            sskts.adapter.theater(connection),
            sskts.adapter.film(connection)
        )
            .then(() => {
                done(new Error('thenable.'));
            })
            .catch(() => {
                done();
            });
    });

    it('importFilms ok', (done) => {
        sskts.service.master.importFilms('118')(
            sskts.adapter.theater(connection),
            sskts.adapter.film(connection)
        )
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('importPerformances fail', (done) => {
        sskts.service.master.importPerformances('000', '20170301', '20170303')(
            sskts.adapter.film(connection),
            sskts.adapter.screen(connection),
            sskts.adapter.performance(connection)
        )
            .then(() => {
                done(new Error('thenable.'));
            })
            .catch(() => {
                done();
            });
    });

    it('importPerformances ok', (done) => {
        sskts.service.master.importPerformances('118', '20170301', '20170303')(
            sskts.adapter.film(connection),
            sskts.adapter.screen(connection),
            sskts.adapter.performance(connection)
        )
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findTheater ok', (done) => {
        sskts.service.master.findTheater('118')(sskts.adapter.theater(connection))
            .then((theaterOption) => {
                assert(theaterOption.isDefined);
                assert.equal(theaterOption.get().id, '118');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findTheater not found', (done) => {
        sskts.service.master.findTheater('000')(sskts.adapter.theater(connection))
            .then((theaterOption) => {
                assert(theaterOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    // todo 特定のパフォーマンスコードでしかテスト通らない
    it('findPerformance ok', (done) => {
        sskts.service.master.findPerformance('1182017030116140071355')(sskts.adapter.performance(connection))
            .then((performanceOption) => {
                assert(performanceOption.isDefined);
                assert.equal(performanceOption.get().id, '1182017030116140071355');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findPerformance not found', (done) => {
        sskts.service.master.findPerformance('000')(sskts.adapter.performance(connection))
            .then((performanceOption) => {
                assert(performanceOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findFilm ok', (done) => {
        sskts.service.master.findFilm('118170620')(sskts.adapter.film(connection))
            .then((filmOption) => {
                assert(filmOption.isDefined);
                assert.equal(filmOption.get().id, '118170620');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findFilm not found', (done) => {
        sskts.service.master.findFilm('000000000')(sskts.adapter.film(connection))
            .then((filmOption) => {
                assert(filmOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('searchPerformances by theater ok', (done) => {
        sskts.service.master.searchPerformances({ theater: '118' })(sskts.adapter.performance(connection))
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
        sskts.service.master.searchPerformances({ day: '20170301' })(sskts.adapter.performance(connection))
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
