"use strict";
// tslint:disable-next-line:missing-jsdoc
const assert = require("assert");
const mongoose = require("mongoose");
const SSKTS = require("../../lib/sskts-domain");
let connection;
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
