/**
 * 通知サービステスト
 *
 * @ignore
 */
import * as assert from 'assert';

import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import NotificationGroup from '../../lib/factory/notificationGroup';
import * as NotificationService from '../../lib/service/notification';

import ArgumentError from '../../lib/error/argument';

const DUMMY_IMAGE_URL = 'https://dummyimage.com/200x200';

describe('通知サービス Eメール通知', () => {
    it('成功', async () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'sskts-domain:test:service:notification-test',
            content: 'sskts-domain:test:service:notification-test'
        });

        await NotificationService.sendEmail(notification)();
    });

    it('送信先不適切で失敗', async () => {
        try {
            await NotificationService.sendEmail({
                id: 'xxx',
                group: NotificationGroup.EMAIL,
                from: 'noreply@example.net',
                to: 'invalidemail',
                subject: 'sskts-domain:test:service:notification-test',
                content: 'sskts-domain:test:service:notification-test',
                send_at: new Date()
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
        await NotificationService.report2developers(
            'sskts-domain:test:service:notification-test',
            'sskts-domain:test:service:notification-test',
            DUMMY_IMAGE_URL,
            DUMMY_IMAGE_URL
        )();
    });

    it('アクセストークンが設定されていないと失敗', async () => {
        const accessToken = process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN;
        delete process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN;
        let report2developers: any;
        try {
            await NotificationService.report2developers(
                'sskts-domain:test:service:notification-test',
                'sskts-domain:test:service:notification-test'
            )();
        } catch (error) {
            report2developers = error;
        }

        assert(report2developers instanceof Error);
        process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN = accessToken;
    });

    it('サムネイル画像URLが不適切だと失敗', async () => {
        let report2developers: any;
        try {
            await NotificationService.report2developers(
                'sskts-domain:test:service:notification-test',
                'sskts-domain:test:service:notification-test',
                'xxx'
            )();
        } catch (error) {
            report2developers = error;
        }

        assert(report2developers instanceof ArgumentError);
        assert((<ArgumentError>report2developers).argumentName, 'imageThumbnail');
    });

    it('フル画像URLが不適切だと失敗', async () => {
        let report2developers: any;
        try {
            await NotificationService.report2developers(
                'sskts-domain:test:service:notification-test',
                'sskts-domain:test:service:notification-test',
                DUMMY_IMAGE_URL,
                'xxx'
            )();
        } catch (error) {
            report2developers = error;
        }

        assert(report2developers instanceof ArgumentError);
        assert((<ArgumentError>report2developers).argumentName, 'imageFullsize');
    });
});
