/// <reference types="mongoose" />
/**
 * 通知ファクトリー
 *
 * @namespace NotificationFactory
 */
import EmailNotification from "../model/notification/email";
import ObjectId from "../model/objectId";
export declare function createEmail(args: {
    _id?: ObjectId;
    from: string;
    to: string;
    subject: string;
    content: string;
}): EmailNotification;
