"use strict";
/**
 * Eメール通知ファクトリーテスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const EmailNotificationFactory = require("../../../lib/factory/notification/email");
let TEST_CREATE_EMAIL_NOTIFICATION_ARGS;
before(() => __awaiter(this, void 0, void 0, function* () {
    TEST_CREATE_EMAIL_NOTIFICATION_ARGS = {
        from: 'noreply@example.com',
        to: 'noreply@example.com',
        subject: 'xxx',
        content: 'xxx'
    };
}));
describe('Eメール通知ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            EmailNotificationFactory.create(TEST_CREATE_EMAIL_NOTIFICATION_ARGS);
        });
    });
    it('件名が空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_EMAIL_NOTIFICATION_ARGS, { subject: '' });
        assert.throws(() => {
            EmailNotificationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'subject');
            return true;
        });
    });
    it('fromが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_EMAIL_NOTIFICATION_ARGS, { from: '' });
        assert.throws(() => {
            EmailNotificationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'from');
            return true;
        });
    });
    it('fromが不適切なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_EMAIL_NOTIFICATION_ARGS, { from: 'xxx' });
        assert.throws(() => {
            EmailNotificationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'from');
            return true;
        });
    });
    it('toが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_EMAIL_NOTIFICATION_ARGS, { to: '' });
        assert.throws(() => {
            EmailNotificationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'to');
            return true;
        });
    });
    it('toが不適切なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_EMAIL_NOTIFICATION_ARGS, { to: 'xxx' });
        assert.throws(() => {
            EmailNotificationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'to');
            return true;
        });
    });
    it('contentが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_EMAIL_NOTIFICATION_ARGS, { content: '' });
        assert.throws(() => {
            EmailNotificationFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'content');
            return true;
        });
    });
    it('send_atがDateでないので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_EMAIL_NOTIFICATION_ARGS, { send_at: {} });
        assert.throws(() => {
            EmailNotificationFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'send_at');
            return true;
        });
    });
});
