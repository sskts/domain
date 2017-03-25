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
describe('notification service', () => {
    it('send an email', () => __awaiter(this, void 0, void 0, function* () {
        const notification = sskts.factory.notification.email.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'test subject',
            content: 'test content'
        });
        yield sskts.service.notification.sendEmail(notification)();
    }));
    it('cannot send an email because to is invalid.', () => __awaiter(this, void 0, void 0, function* () {
        let sendEmailError;
        try {
            yield sskts.service.notification.sendEmail({
                id: 'xxx',
                group: sskts.factory.notificationGroup.EMAIL,
                from: 'noreply@example.net',
                to: 'invalidemail',
                subject: 'test subject',
                content: 'test content'
            })();
        }
        catch (error) {
            sendEmailError = error;
        }
        assert(sendEmailError instanceof Error);
        assert.equal(sendEmailError.constructor.name, 'SendGridError');
    }));
    it('report2developers ok', () => __awaiter(this, void 0, void 0, function* () {
        yield sskts.service.notification.report2developers('test', 'test')();
    }));
});
