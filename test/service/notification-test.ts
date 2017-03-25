/**
 * 通知サービステスト
 *
 * @ignore
 */
import * as assert from 'assert';

import * as sskts from '../../lib/index';

describe('notification service', () => {
    it('send an email', async () => {
        const notification = sskts.factory.notification.email.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'test subject',
            content: 'test content'
        });

        await sskts.service.notification.sendEmail(notification)();
    });

    it('cannot send an email because to is invalid.', async () => {
        let sendEmailError: any;
        try {
            await sskts.service.notification.sendEmail({
                id: 'xxx',
                group: sskts.factory.notificationGroup.EMAIL,
                from: 'noreply@example.net',
                to: 'invalidemail',
                subject: 'test subject',
                content: 'test content'
            })();
        } catch (error) {
            sendEmailError = error;
        }

        assert(sendEmailError instanceof Error);
        assert.equal(sendEmailError.constructor.name, 'SendGridError');
    });

    it('report2developers ok', async () => {
        await sskts.service.notification.report2developers('test', 'test')();
    });
});
