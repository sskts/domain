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
});
