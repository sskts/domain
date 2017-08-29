/**
 * notification service
 * 通知サービス
 * @namespace service/notification
 */
import * as factory from '@motionpicture/sskts-factory';
export declare type Operation<T> = () => Promise<T>;
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
export declare function sendEmail(email: factory.notification.email.INotification): Operation<void>;
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
export declare function report2developers(subject: string, content: string, imageThumbnail?: string, imageFullsize?: string): Operation<void>;
