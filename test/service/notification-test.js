"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// tslint:disable-next-line:missing-jsdoc
const SSKTS = require("../../lib/sskts-domain");
describe('notification service', () => {
    it('send an email', () => __awaiter(this, void 0, void 0, function* () {
        const notification = SSKTS.Notification.createEmail({
            from: 'noreply@localhost',
            to: 'hello@motionpicture.jp',
            subject: 'test subject',
            content: 'test content'
        });
        yield SSKTS.NotificationService.sendEmail(notification)();
    }));
});
