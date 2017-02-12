import EmailNotification from "../../model/notification/email";
import NotificationService from "../notification";
import SendGrid = require("sendgrid");

export type SendGridOperation<T> = (sendgrid: typeof SendGrid) => Promise<T>;

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
    public sendEmail(email: EmailNotification): SendGridOperation<void> {
        return async (sendgrid: typeof SendGrid) => {
            const mail = new sendgrid.mail.Mail(
                new sendgrid.mail.Email(email.from),
                email.subject,
                new sendgrid.mail.Email(email.to),
                new sendgrid.mail.Content("text/html", email.content)
            );

            const sg = sendgrid(process.env.SENDGRID_API_KEY);

            const request = sg.emptyRequest({
                host: "api.sendgrid.com",
                method: "POST",
                path: "/v3/mail/send",
                headers: {},
                body: mail.toJSON(),
                queryParams: {},
                test: false,
                port: ""
            });

            await sg.API(request);
            // TODO check the response.
            // const response = await sg.API(request);
        };
    }
}