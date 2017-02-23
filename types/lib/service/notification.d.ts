import * as SendGrid from 'sendgrid';
import Notification from '../model/notification';
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
export declare function sendEmail(email: Notification.EmailNotification): SendGridOperation<void>;
