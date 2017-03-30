/**
 * プッシュ通知キューファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as EmailNotificationFactory from '../../../lib/factory/notification/email';
import * as PushNotificationQueueFactory from '../../../lib/factory/queue/pushNotification';
import QueueStatus from '../../../lib/factory/queueStatus';

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
                status: QueueStatus.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        });
    });

    it('通知が空なので作成できない', () => {
        assert.throws(
            () => {
                PushNotificationQueueFactory.create({
                    notification: <any>{},
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'notification');
                return true;
            }
        );
    });

    it('ステータスが空なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                PushNotificationQueueFactory.create({
                    notification: notification,
                    status: <any>'',
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'status');
                return true;
            }
        );
    });

    it('実行日時が不適切なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                PushNotificationQueueFactory.create({
                    notification: notification,
                    status: QueueStatus.UNEXECUTED,
                    run_at: <any>(new Date()).toString,
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'run_at');
                return true;
            }
        );
    });

    it('最大試行回数が数字でないので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                PushNotificationQueueFactory.create({
                    notification: notification,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: <any>'10',
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'max_count_try');
                return true;
            }
        );
    });

    it('最終試行日時が不適切なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                PushNotificationQueueFactory.create({
                    notification: notification,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: <any>{},
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'last_tried_at');
                return true;
            }
        );
    });

    it('試行回数が数字でないので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                PushNotificationQueueFactory.create({
                    notification: notification,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: <any>'0',
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'count_tried');
                return true;
            }
        );
    });

    it('結果が配列でないので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                PushNotificationQueueFactory.create({
                    notification: notification,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: <any>{}
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'results');
                return true;
            }
        );
    });
});
