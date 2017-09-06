/**
 * notification service
 * 通知サービス
 * @namespace service/notification
 */

import * as factory from '@motionpicture/sskts-factory';
// tslint:disable-next-line:no-require-imports
import sgMail = require('@sendgrid/mail');
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';
import * as util from 'util';
import * as validator from 'validator';

export type Operation<T> = () => Promise<T>;

const debug = createDebug('sskts-domain:service:notification');

export const LINE_NOTIFY_URL = 'https://notify-api.line.me/api/notify';

/**
 * send an email
 * Eメールを送信する
 * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 * @export
 * @function
 * @param {EmailNotification} email
 * @returns {Operation<void>}
 * @see https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 * @memberof service/notification
 */
export function sendEmail(email: factory.notification.email.INotification): Operation<void> {
    return async () => {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email.data.to,
            from: email.data.from,
            subject: email.data.subject,
            text: email.data.content,
            // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            // categories: ['Transactional', 'My category'],
            // tslint:disable-next-line:no-suspicious-comment
            // TODO 送信予定を追加することもできるが、タスクの実行予定日時でコントロールするかもしれないのでいったん保留
            // sendAt: moment(email.send_at).unix(),
            // 追跡用に通知IDをカスタムフィールドとしてセットする
            customArgs: {
                notification: email.id
            }
        };

        debug('requesting sendgrid api...', msg);
        const response = await sgMail.send(msg);
        debug('response is', response);

        // check the response.
        if (response[0].statusCode !== httpStatus.ACCEPTED) {
            throw new Error(`sendgrid request not accepted. response is ${util.inspect(response)}`);
        }
    };
}

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
export function report2developers(subject: string, content: string, imageThumbnail?: string, imageFullsize?: string): Operation<void> {
    return async () => {
        if (process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN === undefined) {
            throw new Error('access token for LINE Notify undefined');
        }

        const message = `
環境[${process.env.NODE_ENV}]
--------
${subject}
--------
${content}`
            ;

        // LINE通知APIにPOST
        const formData: any = { message: message };
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

        const response = await request.post(
            {
                url: LINE_NOTIFY_URL,
                auth: { bearer: process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN },
                form: formData,
                json: true,
                simple: false,
                resolveWithFullResponse: true
            }
        ).promise();

        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
    };
}
