/**
 * 通知サービス
 *
 * @namespace NotificationService
 */
import * as SendGrid from 'sendgrid';
import EmailNotification from '../model/notification/email';
export declare type SendGridOperation<T> = (sendgrid: typeof SendGrid) => Promise<T>;
/**
 * メール送信
 * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 *
 * @param {EmailNotification} email
 * @returns {SendGridOperation<void>}
 *
 * @memberOf NotificationService
 */
export declare function sendEmail(email: EmailNotification): SendGridOperation<void>;
