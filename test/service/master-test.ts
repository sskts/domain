// tslint:disable-next-line:missing-jsdoc
import * as mongoose from 'mongoose';
import * as SSKTS from '../../lib/sskts-domain';

mongoose.connect(process.env.MONGOLAB_URI).then(
  () => {
    console.error('connected.');
  },
  (err) => {
    console.error(err);
  }
);

describe('master service', () => {
  it('importTheater fail', (done) => {
    SSKTS.MasterService.importTheater('000')(SSKTS.createTheaterRepository(mongoose.connection))
      .then(() => {
        done(new Error('thenable.'));
      })
      .catch(() => {
        done();
      });
  });

  it('importTheater ok', (done) => {
    SSKTS.MasterService.importTheater('118')(SSKTS.createTheaterRepository(mongoose.connection))
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('importScreens fail', (done) => {
    SSKTS.MasterService.importScreens('000')(
      SSKTS.createTheaterRepository(mongoose.connection),
      SSKTS.createScreenRepository(mongoose.connection)
    )
      .then(() => {
        done(new Error('thenable.'));
      })
      .catch(() => {
        done();
      });
  });

  it('importScreens ok', (done) => {
    SSKTS.MasterService.importScreens('118')(
      SSKTS.createTheaterRepository(mongoose.connection),
      SSKTS.createScreenRepository(mongoose.connection)
    )
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('importFilms fail', (done) => {
    SSKTS.MasterService.importFilms('000')(
      SSKTS.createTheaterRepository(mongoose.connection),
      SSKTS.createFilmRepository(mongoose.connection)
    )
      .then(() => {
        done(new Error('thenable.'));
      })
      .catch(() => {
        done();
      });
  });

  it('importFilms ok', (done) => {
    SSKTS.MasterService.importFilms('118')(
      SSKTS.createTheaterRepository(mongoose.connection),
      SSKTS.createFilmRepository(mongoose.connection)
    )
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('importPerformances fail', (done) => {
    SSKTS.MasterService.importPerformances('000', '20170101', '20170331')(
      SSKTS.createFilmRepository(mongoose.connection),
      SSKTS.createScreenRepository(mongoose.connection),
      SSKTS.createPerformanceRepository(mongoose.connection)
    )
      .then(() => {
        done(new Error('thenable.'));
      })
      .catch(() => {
        done();
      });
  });

  it('importPerformances ok', (done) => {
    SSKTS.MasterService.importPerformances('118', '20170101', '20170331')(
      SSKTS.createFilmRepository(mongoose.connection),
      SSKTS.createScreenRepository(mongoose.connection),
      SSKTS.createPerformanceRepository(mongoose.connection)
    )
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
