/**
 * notification service test
 * @ignore
 */

// tslint:disable-next-line:no-require-imports
import sgMail = require('@sendgrid/mail');
import { ACCEPTED, BAD_REQUEST, OK } from 'http-status';
import * as nock from 'nock';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('sendEmail()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('SendGridの状態が正常であれば、エラーにならないはず', async () => {
        const emailMessage = {
            identifier: 'identifier',
            sender: {},
            toRecipient: {}
        };
        const sendResponse = [{ statusCode: ACCEPTED }];

        sandbox.mock(sgMail).expects('send').once().returns(Promise.resolve(sendResponse));

        const result = await sskts.service.notification.sendEmail(<any>emailMessage)();

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('SendGridAPIのステータスコードがACCEPTEDでなｋれば、エラーになるはず', async () => {
        const emailMessage = {
            identifier: 'identifier',
            sender: {},
            toRecipient: {}
        };
        const sendResponse = [{ statusCode: BAD_REQUEST }];

        sandbox.mock(sgMail).expects('send').once().returns(Promise.resolve(sendResponse));

        const sendEmailError = await sskts.service.notification.sendEmail(<any>emailMessage)()
            .catch((err) => err);

        assert(sendEmailError instanceof Error);
        sandbox.verify();
    });
});

describe('report2developers()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('LINE Notifyの状態が正常であれば、エラーにならないはず', async () => {
        const scope = nock('https://notify-api.line.me').post('/api/notify').reply(OK);
        const imageThumbnail = 'https://example.com';
        const imageFullsize = 'https://example.com';

        const result = await sskts.service.notification.report2developers('', '', imageThumbnail, imageFullsize)();

        assert.equal(result, undefined);
        assert(scope.isDone());
    });

    it('LINE Notifyの状態が正常でなければ、エラーになるはず', async () => {
        const scope = nock('https://notify-api.line.me').post('/api/notify').reply(BAD_REQUEST);

        const reportError = await sskts.service.notification.report2developers('', '')()
            .catch((err) => err);

        assert(reportError instanceof Error);
        assert(scope.isDone());
    });

    it('imageThumbnailがURLでなければ、エラーになるはず', async () => {
        const scope = nock('https://notify-api.line.me').post('/api/notify').reply(OK);
        const imageThumbnail = 'invalidUrl';

        const reportError = await sskts.service.notification.report2developers('', '', imageThumbnail)()
            .catch((err) => err);

        assert(reportError instanceof sskts.factory.errors.Argument);
        assert(!scope.isDone());
    });

    it('imageFullsizeがURLでなければ、エラーになるはず', async () => {
        const scope = nock('https://notify-api.line.me').post('/api/notify').reply(OK);
        const imageThumbnail = 'https://example.com';
        const imageFullsize = 'invalidUrl';

        const reportError = await sskts.service.notification.report2developers('', '', imageThumbnail, imageFullsize)()
            .catch((err) => err);

        assert(reportError instanceof sskts.factory.errors.Argument);
        assert(!scope.isDone());
    });
});
