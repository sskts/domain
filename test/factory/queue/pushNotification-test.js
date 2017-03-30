"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * プッシュ通知キューファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const EmailNotificationFactory = require("../../../lib/factory/notification/email");
const PushNotificationQueueFactory = require("../../../lib/factory/queue/pushNotification");
const queueStatus_1 = require("../../../lib/factory/queueStatus");
describe('プッシュ通知キューファクトリー', () => {
    it('作成できる', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.doesNotThrow(() => {
            PushNotificationQueueFactory.create({
                notification: notification,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        });
    });
    it('通知が空なので作成できない', () => {
        assert.throws(() => {
            PushNotificationQueueFactory.create({
                notification: {},
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'notification');
            return true;
        });
    });
    it('ステータスが空なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.throws(() => {
            PushNotificationQueueFactory.create({
                notification: notification,
                status: '',
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'status');
            return true;
        });
    });
    it('実行日時が不適切なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.throws(() => {
            PushNotificationQueueFactory.create({
                notification: notification,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: (new Date()).toString,
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'run_at');
            return true;
        });
    });
    it('最大試行回数が数字でないので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.throws(() => {
            PushNotificationQueueFactory.create({
                notification: notification,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: '10',
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'max_count_try');
            return true;
        });
    });
    it('最終試行日時が不適切なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.throws(() => {
            PushNotificationQueueFactory.create({
                notification: notification,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: {},
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'last_tried_at');
            return true;
        });
    });
    it('試行回数が数字でないので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.throws(() => {
            PushNotificationQueueFactory.create({
                notification: notification,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: '0',
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'count_tried');
            return true;
        });
    });
    it('結果が配列でないので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.throws(() => {
            PushNotificationQueueFactory.create({
                notification: notification,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: {}
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'results');
            return true;
        });
    });
});
