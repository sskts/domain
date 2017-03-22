/**
 * 通知サービステスト
 *
 * @ignore
 */
import * as sskts from '../../lib/index';

describe('notification service', () => {
    it('send an email', async () => {
        const notification = sskts.factory.notification.email.create({
            from: 'noreply@localhost',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'test subject',
            content: 'test content'
        });

        await sskts.service.notification.sendEmail(notification)();
    });

    it('report2developers ok', async () => {
        await sskts.service.notification.report2developers('test', 'test')();
    });
});
