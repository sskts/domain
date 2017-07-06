"use strict";
/**
 * 通知サービス
 *
 * @namespace service/notification
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
const createDebug = require("debug");
const httpStatus = require("http-status");
const request = require("request-promise-native");
const sendgrid = require("sendgrid");
const util = require("util");
const validator = require("validator");
const argument_1 = require("../error/argument");
const debug = createDebug('sskts-domain:service:notification');
const LINE_NOTIFY_URL = 'https://notify-api.line.me/api/notify';
/**
 * メール送信
 * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 *
 * @param {EmailNotification} email
 * @returns {Operation<void>}
 * @see https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 *
 * @memberof service/notification
 */
function sendEmail(email) {
    return () => __awaiter(this, void 0, void 0, function* () {
        debug('sending email...', email.content);
        const mail = new sendgrid.mail.Mail(new sendgrid.mail.Email(email.from), email.subject, new sendgrid.mail.Email(email.to), new sendgrid.mail.Content('text/plain', email.content));
        // 追跡用に通知IDをカスタムフィールドとしてセットする
        mail.addCustomArg(new sendgrid.mail.CustomArgs('notification', email.id));
        // todo 送信予定を追加することもできるが、タスクの実行予定日時でコントロールするかもしれないのでいったん保留
        // mail.setSendAt(moment(email.send_at).unix());
        const sg = sendgrid(process.env.SENDGRID_API_KEY);
        const sendGridRequest = sg.emptyRequest({
            host: 'api.sendgrid.com',
            method: 'POST',
            path: '/v3/mail/send',
            headers: {},
            body: mail.toJSON(),
            queryParams: {},
            test: false,
            port: ''
        });
        debug('requesting sendgrid api...', sendGridRequest);
        const response = yield sg.API(sendGridRequest);
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
 * @see https://notify-bot.line.me/doc/ja/
 * @memberof service/notification
 */
function report2developers(subject, content, imageThumbnail, imageFullsize) {
    return () => __awaiter(this, void 0, void 0, function* () {
        if (process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN === undefined) {
            throw new Error('access token for LINE Notify undefined');
        }
        const message = `
環境[${process.env.NODE_ENV}]
--------
${subject}
--------
${content}`;
        // LINE通知APIにPOST
        const formData = { message: message };
        if (imageThumbnail !== undefined) {
            if (!validator.isURL(imageThumbnail)) {
                throw new argument_1.default('imageThumbnail', 'imageThumbnail should be URL');
            }
            formData.imageThumbnail = imageThumbnail;
        }
        if (imageFullsize !== undefined) {
            if (!validator.isURL(imageFullsize)) {
                throw new argument_1.default('imageFullsize', 'imageFullsize should be URL');
            }
            formData.imageFullsize = imageFullsize;
        }
        const response = yield request.post({
            url: LINE_NOTIFY_URL,
            auth: { bearer: process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN },
            form: formData,
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).promise();
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
    });
}
exports.report2developers = report2developers;
