/**
 * 通知サービス
 *
 * @namespace NotificationService
 */
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';
import * as sendgrid from 'sendgrid';
import * as util from 'util';
import * as validator from 'validator';

import * as EmailNotificationFactory from '../factory/notification/email';

import ArgumentError from '../error/argument';

export type Operation<T> = () => Promise<T>;

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
 * @memberOf NotificationService
 */
export function sendEmail(email: EmailNotificationFactory.IEmailNotification): Operation<void> {
    return async () => {
        debug('sending email...', email.content);
        const mail = new sendgrid.mail.Mail(
            new sendgrid.mail.Email(email.from),
            email.subject,
            new sendgrid.mail.Email(email.to),
            new sendgrid.mail.Content('text/plain', email.content)
        );

        // 追跡用に通知IDをカスタムフィールドとしてセットする
        mail.addCustomArg(new sendgrid.mail.CustomArgs('notification', email.id));
        // todo 送信予定を追加することもできるが、キューの実行予定日時でコントロールするかもしれないのでいったん保留
        // mail.setSendAt(moment(email.send_at).unix());

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
        const response = await sg.API(request);
        debug('response is', response);

        // check the response.
        if (response.statusCode !== httpStatus.ACCEPTED) {
            throw new Error(`sendgrid request not accepted. response is ${util.inspect(response)}`);
        }
    };
}

/**
 * 開発者に報告する
 *
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
                throw new ArgumentError('imageThumbnail', 'imageThumbnail should be URL');
            }

            formData.imageThumbnail = imageThumbnail;
        }
        if (imageFullsize !== undefined) {
            if (!validator.isURL(imageFullsize)) {
                throw new ArgumentError('imageFullsize', 'imageFullsize should be URL');
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
