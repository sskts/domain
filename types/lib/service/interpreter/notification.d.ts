import EmailNotification from "../../model/notification/email";
import NotificationService from "../notification";
import * as SendGrid from "sendgrid";
export declare type SendGridOperation<T> = (sendgrid: typeof SendGrid) => Promise<T>;
/**
 * 通知サービス
 *
 * @class NotificationServiceInterpreter
 * @implements {NotificationService}
 */
export default class NotificationServiceInterpreter implements NotificationService {
    /**
     * メール送信
     * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
     *
     * @param {EmailNotification} email
     * @returns {SendGridOperation<void>}
     *
     * @memberOf NotificationServiceInterpreter
     */
    sendEmail(email: EmailNotification): SendGridOperation<void>;
}
