/**
 * Eメール通知ファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as EmailNotificationFactory from '../../../lib/factory/notification/email';

describe('Eメール通知ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            EmailNotificationFactory.create({
                from: 'noreply@example.com',
                to: 'noreply@example.com',
                subject: 'xxx',
                content: 'xxx'
            });
        });
    });

    it('件名が空なので作成できない', () => {
        assert.throws(
            () => {
                EmailNotificationFactory.create({
                    from: 'noreply@example.com',
                    to: 'noreply@example.com',
                    subject: '',
                    content: 'xxx'
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'subject');
                return true;
            }
        );
    });

    it('fromが不適切なので作成できない', () => {
        assert.throws(
            () => {
                EmailNotificationFactory.create({
                    from: 'xxx',
                    to: 'noreply@example.com',
                    subject: 'xxx',
                    content: 'xxx'
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentNullError>err).argumentName, 'from');
                return true;
            }
        );
    });

    it('toが不適切なので作成できない', () => {
        assert.throws(
            () => {
                EmailNotificationFactory.create({
                    from: 'noreply@example.com',
                    to: 'xxx',
                    subject: 'xxx',
                    content: 'xxx'
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentNullError>err).argumentName, 'to');
                return true;
            }
        );
    });
});
