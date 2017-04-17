import * as EmailNotificationFactory from '../factory/notification/email';
export declare type Operation<T> = () => Promise<T>;
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
export declare function sendEmail(email: EmailNotificationFactory.IEmailNotification): Operation<void>;
/**
 * 開発者に報告する
 *
 * @param {string} subject
 * @param {string} content
 * @see https://notify-bot.line.me/doc/ja/
 */
export declare function report2developers(subject: string, content: string, imageThumbnail?: string, imageFullsize?: string): Operation<void>;
