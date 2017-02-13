// tslint:disable-next-line:missing-jsdoc
import * as sendgrid from 'sendgrid';
import * as SSKTS from '../../lib/sskts-domain';

// tslint:disable-next-line:max-line-length
process.env.MONGOLAB_URI = 'mongodb://testsasakiticketmongodbuser:aZHGD262LNsBTQgG9UGQpA6QvbFkKbAhBfxf3vvz@ds056379-a0.mlab.com:56379,ds056379-a1.mlab.com:56372/testsasakiticketmongodb?replicaSet=rs-ds056379';
process.env.SENDGRID_API_KEY = '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';
process.env.GMO_ENDPOINT = 'https://pt01.mul-pay.jp';
// tslint:disable-next-line:no-http-string
process.env.COA_ENDPOINT = 'http://coacinema.aa0.netvolante.jp';
// tslint:disable-next-line:max-line-length
process.env.COA_REFRESH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ';

describe('notification service', () => {
    it('send an email', async () => {
        const notification = SSKTS.NotificationFactory.createEmail({
            from: 'noreply@localhost',
            to: 'hello@motionpicture.jp',
            subject: 'test subject',
            content: 'test content'
        });

        await SSKTS.NotificationService.sendEmail(notification)(sendgrid);
    });
});
