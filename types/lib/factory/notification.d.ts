/// <reference types="mongoose" />
import EmailNotification from "../model/notification/email";
import ObjectId from "../model/objectId";
/**
 * 通知ファクトリー
 *
 * @namespace
 */
declare namespace NotificationFactory {
    function createEmail(args: {
        _id?: ObjectId;
        from: string;
        to: string;
        subject: string;
        content: string;
    }): EmailNotification;
}
export default NotificationFactory;
