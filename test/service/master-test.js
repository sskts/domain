"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:missing-jsdoc
const assert = require("assert");
const mongoose = require("mongoose");
const SSKTS = require("../../lib/index");
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('master service', () => {
    it('importTheater fail', (done) => {
        SSKTS.MasterService.importTheater('000')(SSKTS.createTheaterRepository(connection))
            .then(() => {
            done(new Error('thenable.'));
        })
            .catch(() => {
            done();
        });
    });
    it('importTheater ok', (done) => {
        SSKTS.MasterService.importTheater('118')(SSKTS.createTheaterRepository(connection))
            .then(() => {
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('importScreens fail', (done) => {
        SSKTS.MasterService.importScreens('000')(SSKTS.createTheaterRepository(connection), SSKTS.createScreenRepository(connection))
            .then(() => {
            done(new Error('thenable.'));
        })
            .catch(() => {
            done();
        });
    });
    it('importScreens ok', (done) => {
        SSKTS.MasterService.importScreens('118')(SSKTS.createTheaterRepository(connection), SSKTS.createScreenRepository(connection))
            .then(() => {
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('importFilms fail', (done) => {
        SSKTS.MasterService.importFilms('000')(SSKTS.createTheaterRepository(connection), SSKTS.createFilmRepository(connection))
            .then(() => {
            done(new Error('thenable.'));
        })
            .catch(() => {
            done();
        });
    });
    it('importFilms ok', (done) => {
        SSKTS.MasterService.importFilms('118')(SSKTS.createTheaterRepository(connection), SSKTS.createFilmRepository(connection))
            .then(() => {
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('importPerformances fail', (done) => {
        SSKTS.MasterService.importPerformances('000', '20170101', '20170331')(SSKTS.createFilmRepository(connection), SSKTS.createScreenRepository(connection), SSKTS.createPerformanceRepository(connection))
            .then(() => {
            done(new Error('thenable.'));
        })
            .catch(() => {
            done();
        });
    });
    it('importPerformances ok', (done) => {
        SSKTS.MasterService.importPerformances('118', '20170101', '20170331')(SSKTS.createFilmRepository(connection), SSKTS.createScreenRepository(connection), SSKTS.createPerformanceRepository(connection))
            .then(() => {
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('findTheater ok', (done) => {
        SSKTS.MasterService.findTheater('118')(SSKTS.createTheaterRepository(connection))
            .then((theaterOption) => {
            assert(theaterOption.isDefined);
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('findTheater not found', (done) => {
        SSKTS.MasterService.findTheater('000')(SSKTS.createTheaterRepository(connection))
            .then((theaterOption) => {
            assert(theaterOption.isEmpty);
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('findPerformance not found', (done) => {
        SSKTS.MasterService.findPerformance('000')(SSKTS.createPerformanceRepository(connection))
            .then((performanceOption) => {
            assert(performanceOption.isEmpty);
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
});
