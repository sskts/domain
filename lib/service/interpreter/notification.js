"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 通知サービス
 *
 * @class NotificationServiceInterpreter
 * @implements {NotificationService}
 */
class NotificationServiceInterpreter {
    /**
     * メール送信
     * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
     *
     * @param {EmailNotification} email
     * @returns {SendGridOperation<void>}
     *
     * @memberOf NotificationServiceInterpreter
     */
    sendEmail(email) {
        return (sendgrid) => __awaiter(this, void 0, void 0, function* () {
            const mail = new sendgrid.mail.Mail(new sendgrid.mail.Email(email.from), email.subject, new sendgrid.mail.Email(email.to), new sendgrid.mail.Content("text/html", email.content));
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
            yield sg.API(request);
            // todo check the response.
            // const response = await sg.API(request);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationServiceInterpreter;
