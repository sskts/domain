/**
 * notification service test
 * @ignore
 */

// tslint:disable-next-line:no-require-imports
import sgMail = require('@sendgrid/mail');
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
        const notification = {
            id: 'id',
            group: 'group',
            data: <any>{}
        };
        const sendResponse = [{ statusCode: 202 }];

        sandbox.mock(sgMail).expects('send').once().returns(Promise.resolve(sendResponse));

        const result = await sskts.service.notification.sendEmail(notification)();

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('report2developers()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('LINE Notifyの状態が正常であれば、エラーにならないはず', async () => {
        // tslint:disable-next-line:no-magic-numbers
        const scope = nock('https://notify-api.line.me').post('/api/notify').reply(200);

        const result = await sskts.service.notification.report2developers('', '')();

        assert.equal(result, undefined);
        assert(scope.isDone());
    });
});
