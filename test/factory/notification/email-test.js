"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Eメール通知ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const EmailNotificationFactory = require("../../../lib/factory/notification/email");
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
        assert.throws(() => {
            EmailNotificationFactory.create({
                from: 'noreply@example.com',
                to: 'noreply@example.com',
                subject: '',
                content: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'subject');
            return true;
        });
    });
    it('fromが不適切なので作成できない', () => {
        assert.throws(() => {
            EmailNotificationFactory.create({
                from: 'xxx',
                to: 'noreply@example.com',
                subject: 'xxx',
                content: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'from');
            return true;
        });
    });
    it('toが不適切なので作成できない', () => {
        assert.throws(() => {
            EmailNotificationFactory.create({
                from: 'noreply@example.com',
                to: 'xxx',
                subject: 'xxx',
                content: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'to');
            return true;
        });
    });
});
