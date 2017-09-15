"use strict";
/**
 * notification service
 * 通知サービス
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
const factory = require("@motionpicture/sskts-factory");
// tslint:disable-next-line:no-require-imports
const sgMail = require("@sendgrid/mail");
const createDebug = require("debug");
const httpStatus = require("http-status");
const request = require("request-promise-native");
const util = require("util");
const validator = require("validator");
const debug = createDebug('sskts-domain:service:notification');
exports.LINE_NOTIFY_URL = 'https://notify-api.line.me/api/notify';
/**
 * send an email
 * Eメールを送信する
 * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 * @export
 * @function
 * @param {factory.creativeWork.message.email.ICreativeWork} emailMessage
 * @returns {Operation<void>}
 * @see https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 * @memberof service/notification
 */
function sendEmail(emailMessage) {
    return () => __awaiter(this, void 0, void 0, function* () {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: {
                name: emailMessage.toRecipient.name,
                email: emailMessage.toRecipient.email
            },
            from: {
                name: emailMessage.sender.name,
                email: emailMessage.sender.email
            },
            subject: emailMessage.about,
            text: emailMessage.text,
            // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            // categories: ['Transactional', 'My category'],
            // tslint:disable-next-line:no-suspicious-comment
            // TODO 送信予定を追加することもできるが、タスクの実行予定日時でコントロールするかもしれないのでいったん保留
            // sendAt: moment(email.send_at).unix(),
            // 追跡用に通知IDをカスタムフィールドとしてセットする
            customArgs: {
                emailMessage: emailMessage.identifier
            }
        };
        debug('requesting sendgrid api...', msg);
        const response = yield sgMail.send(msg);
        debug('response is', response);
        // check the response.
        if (response[0].statusCode !== httpStatus.ACCEPTED) {
            throw new Error(`sendgrid request not accepted. response is ${util.inspect(response)}`);
        }
    });
}
exports.sendEmail = sendEmail;
/**
 * report to developers
 * 開発者に報告する
 * @export
 * @function
 * @param {EmailNotification} email
 * @returns {Operation<void>}
 * @memberof service/notification
 * @param {string} subject
 * @param {string} content
 * @see https://notify-bot.line.me/doc/ja/
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
                throw new factory.errors.Argument('imageThumbnail', 'imageThumbnail should be URL');
            }
            formData.imageThumbnail = imageThumbnail;
        }
        if (imageFullsize !== undefined) {
            if (!validator.isURL(imageFullsize)) {
                throw new factory.errors.Argument('imageFullsize', 'imageFullsize should be URL');
            }
            formData.imageFullsize = imageFullsize;
        }
        const response = yield request.post({
            url: exports.LINE_NOTIFY_URL,
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
