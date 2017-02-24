// tslint:disable-next-line:missing-jsdoc
import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as SSKTS from '../../lib/sskts-domain';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('oauth service', () => {
    it('sign ok', (done) => {
        SSKTS.OAuthService.sign(process.env.SSKTS_API_REFRESH_TOKEN, 'admin')
            .then((token) => {
                assert(typeof token === 'string');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('verify invalid', (done) => {
        SSKTS.OAuthService.verify('invalidtoken')
            .then(() => {
                done(new Error('should be invalid.'));
            })
            .catch((err) => {
                assert(err instanceof Error);
                done();
            });
    });
});
