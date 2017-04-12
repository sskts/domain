/**
 * 通知サービステスト
 *
 * @ignore
 */
import * as assert from 'assert';

import * as sskts from '../../lib/index';

describe('通知サービス Eメール通知', () => {
    it('成功', async () => {
        const notification = sskts.factory.notification.email.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'sskts-domain:test:service:notification-test',
            content: 'sskts-domain:test:service:notification-test'
        });

        await sskts.service.notification.sendEmail(notification)();
    });

    it('送信先不適切で失敗', async () => {
        try {
            await sskts.service.notification.sendEmail({
                id: 'xxx',
                group: sskts.factory.notificationGroup.EMAIL,
                from: 'noreply@example.net',
                to: 'invalidemail',
                subject: 'sskts-domain:test:service:notification-test',
                content: 'sskts-domain:test:service:notification-test'
            })();
        } catch (error) {
            assert(error instanceof Error);
            assert.equal(error.constructor.name, 'SendGridError');
            return;
        }

        throw new Error('should not be passed');
    });
});

describe('通知サービス 開発者への報告', () => {
    it('成功', async () => {
        await sskts.service.notification.report2developers(
            'sskts-domain:test:service:notification-test',
            'sskts-domain:test:service:notification-test'
        )();
    });

    it('アクセストークンが設定されていないと失敗', async () => {
        const accessToken = process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN;
        process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN = undefined;
        let report2developers: any;
        try {
            await sskts.service.notification.report2developers(
                'sskts-domain:test:service:notification-test',
                'sskts-domain:test:service:notification-test'
            )();
        } catch (error) {
            report2developers = error;
        }

        assert(report2developers instanceof Error);
        process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN = accessToken;
    });
});
