"use strict";
/**
 * テストリソース
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const EmailNotificationFactory = require("../lib/factory/notification/email");
var notification;
(function (notification) {
    function createEmail() {
        return EmailNotificationFactory.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'sskts-domain:test:resources:notification:email',
            content: 'sskts-domain:test:resources:notification:email'
        });
    }
    notification.createEmail = createEmail;
})(notification = exports.notification || (exports.notification = {}));
