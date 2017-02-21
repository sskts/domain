// tslint:disable-next-line:missing-jsdoc
import * as sendgrid from 'sendgrid';
import * as SSKTS from '../../lib/sskts-domain';

describe('notification service', () => {
    it('send an email', async () => {
        const notification = SSKTS.Notification.createEmail({
            from: 'noreply@localhost',
            to: 'hello@motionpicture.jp',
            subject: 'test subject',
            content: 'test content'
        });

        await SSKTS.NotificationService.sendEmail(notification)(sendgrid);
    });
});
