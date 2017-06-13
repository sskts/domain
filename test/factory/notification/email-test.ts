/**
 * Eメール通知ファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as EmailNotificationFactory from '../../../lib/factory/notification/email';

let TEST_CREATE_EMAIL_NOTIFICATION_ARGS: any;
before(async () => {
    TEST_CREATE_EMAIL_NOTIFICATION_ARGS = {
        from: 'noreply@example.com',
        to: 'noreply@example.com',
        subject: 'xxx',
        content: 'xxx'
    };
});

describe('Eメール通知ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            EmailNotificationFactory.create(TEST_CREATE_EMAIL_NOTIFICATION_ARGS);
        });
    });

    it('件名が空なので作成できない', () => {
        const args = { ...TEST_CREATE_EMAIL_NOTIFICATION_ARGS, ...{ subject: '' } };
        assert.throws(
            () => {
                EmailNotificationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'subject');

                return true;
            }
        );
    });

    it('fromが空なので作成できない', () => {
        const args = { ...TEST_CREATE_EMAIL_NOTIFICATION_ARGS, ...{ from: '' } };
        assert.throws(
            () => {
                EmailNotificationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'from');

                return true;
            }
        );
    });

    it('fromが不適切なので作成できない', () => {
        const args = { ...TEST_CREATE_EMAIL_NOTIFICATION_ARGS, ...{ from: 'xxx' } };
        assert.throws(
            () => {
                EmailNotificationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentNullError>err).argumentName, 'from');

                return true;
            }
        );
    });

    it('toが空なので作成できない', () => {
        const args = { ...TEST_CREATE_EMAIL_NOTIFICATION_ARGS, ...{ to: '' } };
        assert.throws(
            () => {
                EmailNotificationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'to');

                return true;
            }
        );
    });

    it('toが不適切なので作成できない', () => {
        const args = { ...TEST_CREATE_EMAIL_NOTIFICATION_ARGS, ...{ to: 'xxx' } };
        assert.throws(
            () => {
                EmailNotificationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentNullError>err).argumentName, 'to');

                return true;
            }
        );
    });

    it('contentが空なので作成できない', () => {
        const args = { ...TEST_CREATE_EMAIL_NOTIFICATION_ARGS, ...{ content: '' } };
        assert.throws(
            () => {
                EmailNotificationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'content');

                return true;
            }
        );
    });

    it('send_atがDateでないので作成できない', () => {
        const args = { ...TEST_CREATE_EMAIL_NOTIFICATION_ARGS, ...{ send_at: {} } };
        assert.throws(
            () => {
                EmailNotificationFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'send_at');

                return true;
            }
        );
    });
});
