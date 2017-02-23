import Notification from '../model/notification';
export declare type Operation<T> = () => Promise<T>;
/**
 * メール送信
 * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
 *
 * @param {EmailNotification} email
 * @returns {Operation<void>}
 *
 * @memberOf NotificationService
 */
export declare function sendEmail(email: Notification.EmailNotification): Operation<void>;
