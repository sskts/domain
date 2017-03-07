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
        sskts.service.master.importTheater('000')(sskts.createTheaterRepository(connection))
            .then(() => {
                done(new Error('thenable.'));
            })
            .catch(() => {
                done();
            });
    });

    it('importTheater ok', (done) => {
        sskts.service.master.importTheater('118')(sskts.createTheaterRepository(connection))
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('importScreens fail', (done) => {
        sskts.service.master.importScreens('000')(
            sskts.createTheaterRepository(connection),
            sskts.createScreenRepository(connection)
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
            sskts.createTheaterRepository(connection),
            sskts.createScreenRepository(connection)
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
            sskts.createTheaterRepository(connection),
            sskts.createFilmRepository(connection)
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
            sskts.createTheaterRepository(connection),
            sskts.createFilmRepository(connection)
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
            sskts.createFilmRepository(connection),
            sskts.createScreenRepository(connection),
            sskts.createPerformanceRepository(connection)
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
            sskts.createFilmRepository(connection),
            sskts.createScreenRepository(connection),
            sskts.createPerformanceRepository(connection)
        )
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findTheater ok', (done) => {
        sskts.service.master.findTheater('118')(sskts.createTheaterRepository(connection))
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
        sskts.service.master.findTheater('000')(sskts.createTheaterRepository(connection))
            .then((theaterOption) => {
                assert(theaterOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findPerformance ok', (done) => {
        sskts.service.master.findPerformance('1182017030917149061500')(sskts.createPerformanceRepository(connection))
            .then((performanceOption) => {
                assert(performanceOption.isDefined);
                assert.equal(performanceOption.get().id, '1182017030917149061500');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findPerformance not found', (done) => {
        sskts.service.master.findPerformance('000')(sskts.createPerformanceRepository(connection))
            .then((performanceOption) => {
                assert(performanceOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('findFilm ok', (done) => {
        sskts.service.master.findFilm('118170620')(sskts.createFilmRepository(connection))
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
        sskts.service.master.findFilm('000000000')(sskts.createFilmRepository(connection))
            .then((filmOption) => {
                assert(filmOption.isEmpty);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
