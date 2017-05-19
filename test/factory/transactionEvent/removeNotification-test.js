"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 通知追加取引イベントファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const EmailNotificationFactory = require("../../../lib/factory/notification/email");
const RemoveNotificationTransactionEventFactory = require("../../../lib/factory/transactionEvent/removeNotification");
describe('通知追加取引イベントファクトリー', () => {
    it('作成できる', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.doesNotThrow(() => {
            RemoveNotificationTransactionEventFactory.create({
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
        assert.throws(() => {
            RemoveNotificationTransactionEventFactory.create({
                transaction: 'xxx',
                occurred_at: (new Date()).toString(),
                notification: notification
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'occurred_at');
            return true;
        });
    });
    it('取引が空なので作成できない', () => {
        const notification = EmailNotificationFactory.create({
            from: 'noreply@example.com',
            to: 'noreply@example.com',
            subject: 'xxx',
            content: 'xxx'
        });
        assert.throws(() => {
            RemoveNotificationTransactionEventFactory.create({
                transaction: '',
                occurred_at: new Date(),
                notification: notification
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'transaction');
            return true;
        });
    });
    it('通知が空なので作成できない', () => {
        const notification = {};
        assert.throws(() => {
            RemoveNotificationTransactionEventFactory.create({
                transaction: 'xxx',
                occurred_at: new Date(),
                notification: notification
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'notification');
            return true;
        });
    });
});
