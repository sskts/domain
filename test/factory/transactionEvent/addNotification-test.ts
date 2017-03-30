/**
 * 通知追加取引イベントファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as EmailNotificationFactory from '../../../lib/factory/notification/email';
import * as AddNotificationTransactionEventFactory from '../../../lib/factory/transactionEvent/addNotification';

describe('通知追加取引イベントファクトリー', () => {
    it('作成できる', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.doesNotThrow(() => {
            AddNotificationTransactionEventFactory.create({
                transaction: 'xxx',
                occurred_at: new Date(),
                notification: notification
            });
        });
    });

    it('発生日時が不適切なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                AddNotificationTransactionEventFactory.create({
                    transaction: 'xxx',
                    occurred_at: <any>(new Date()).toString(),
                    notification: notification
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'occurred_at');
                return true;
            }
        );
    });

    it('取引が空なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });

        assert.throws(
            () => {
                AddNotificationTransactionEventFactory.create({
                    transaction: '',
                    occurred_at: new Date(),
                    notification: notification
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'transaction');
                return true;
            }
        );
    });

    it('通知が空なので作成できない', () => {
        assert.throws(
            () => {
                AddNotificationTransactionEventFactory.create({
                    transaction: 'xxx',
                    occurred_at: new Date(),
                    notification: <any>{}
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'notification');
                return true;
            }
        );
    });
});
