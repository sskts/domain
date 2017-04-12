"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 通知サービステスト
 *
 * @ignore
 */
const assert = require("assert");
const sskts = require("../../lib/index");
describe('通知サービス Eメール通知', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const notification = sskts.factory.notification.email.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'sskts-domain:test:service:notification-test',
            content: 'sskts-domain:test:service:notification-test'
        });
        yield sskts.service.notification.sendEmail(notification)();
    }));
    it('送信先不適切で失敗', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield sskts.service.notification.sendEmail({
                id: 'xxx',
                group: sskts.factory.notificationGroup.EMAIL,
                from: 'noreply@example.net',
                to: 'invalidemail',
                subject: 'sskts-domain:test:service:notification-test',
                content: 'sskts-domain:test:service:notification-test'
            })();
        }
        catch (error) {
            assert(error instanceof Error);
            assert.equal(error.constructor.name, 'SendGridError');
            return;
        }
        throw new Error('should not be passed');
    }));
});
describe('通知サービス 開発者への報告', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        yield sskts.service.notification.report2developers('sskts-domain:test:service:notification-test', 'sskts-domain:test:service:notification-test')();
    }));
    it('アクセストークンが設定されていないと失敗', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN;
        process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN = undefined;
        let report2developers;
        try {
            yield sskts.service.notification.report2developers('sskts-domain:test:service:notification-test', 'sskts-domain:test:service:notification-test')();
        }
        catch (error) {
            report2developers = error;
        }
        assert(report2developers instanceof Error);
        process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN = accessToken;
    }));
});
