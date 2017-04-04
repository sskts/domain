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
 * 通知サービス
 *
 * @namespace NotificationService
 */
const createDebug = require("debug");
const httpStatus = require("http-status");
const sendgrid = require("sendgrid");
const util = require("util");
const EmailNotificationFactory = require("../factory/notification/email");
const debug = createDebug('sskts-domain:service:notification');
/**
 * メール送信
 * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 *
 * @param {EmailNotification} email
 * @returns {Operation<void>}
 * @see https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 *
 * @memberOf NotificationService
 */
function sendEmail(email) {
    return () => __awaiter(this, void 0, void 0, function* () {
        debug('sending email...', email.content);
        const mail = new sendgrid.mail.Mail(new sendgrid.mail.Email(email.from), email.subject, new sendgrid.mail.Email(email.to), new sendgrid.mail.Content('text/plain', email.content));
        const sg = sendgrid(process.env.SENDGRID_API_KEY);
        const request = sg.emptyRequest({
            host: 'api.sendgrid.com',
            method: 'POST',
            path: '/v3/mail/send',
            headers: {},
            body: mail.toJSON(),
            queryParams: {},
            test: false,
            port: ''
        });
        debug('requesting sendgrid api...', request);
        const response = yield sg.API(request);
        debug('response is', response);
        // check the response.
        if (response.statusCode !== httpStatus.ACCEPTED) {
            throw new Error(`sendgrid request not accepted. response is ${util.inspect(response)}`);
        }
    });
}
exports.sendEmail = sendEmail;
/**
 * 開発者に報告する
 *
 * @param {string} subject
 * @param {string} content
 */
function report2developers(subject, content) {
    return () => __awaiter(this, void 0, void 0, function* () {
        yield sendEmail(EmailNotificationFactory.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: `sskts-domain[${process.env.NODE_ENV}]:開発者へ報告があります ${subject}`,
            content: content
        }))();
    });
}
exports.report2developers = report2developers;
