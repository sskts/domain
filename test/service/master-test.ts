// tslint:disable-next-line:missing-jsdoc
import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('master service', () => {
    it('importTheater fail', (done) => {
        sskts.service.master.importTheater('000')(sskts.createTheaterAdapter(connection))
            .then(() => {
                done(new Error('thenable.'));
            })
            .catch(() => {
                done();
            });
    });

    it('importTheater ok', (done) => {
        sskts.service.master.importTheater('118')(sskts.createTheaterAdapter(connection))
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('importScreens fail', (done) => {
        sskts.service.master.importScreens('000')(
            sskts.createTheaterAdapter(connection),
            sskts.createScreenAdapter(connection)
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
            sskts.createTheaterAdapter(connection),
            sskts.createScreenAdapter(connection)
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
            sskts.createTheaterAdapter(connection),
            sskts.createFilmAdapter(connection)
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
            sskts.createTheaterAdapter(connection),
            sskts.createFilmAdapter(connection)
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
            sskts.createFilmAdapter(connection),
            sskts.createScreenAdapter(connection),
            sskts.createPerformanceAdapter(connection)
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
            sskts.createFilmAdapter(connection),
            sskts.createScreenAdapter(connection),
            sskts.createPerformanceAdapter(connection)
        )
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findTheater ok', (done) => {
        sskts.service.master.findTheater('118')(sskts.createTheaterAdapter(connection))
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
        sskts.service.master.findTheater('000')(sskts.createTheaterAdapter(connection))
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
        sskts.service.master.findPerformance('1182017030116140071355')(sskts.createPerformanceAdapter(connection))
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
        sskts.service.master.findPerformance('000')(sskts.createPerformanceAdapter(connection))
            .then((performanceOption) => {
                assert(performanceOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findFilm ok', (done) => {
        sskts.service.master.findFilm('118170620')(sskts.createFilmAdapter(connection))
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
        sskts.service.master.findFilm('000000000')(sskts.createFilmAdapter(connection))
            .then((filmOption) => {
                assert(filmOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
