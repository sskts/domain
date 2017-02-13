/**
 * 通知ファクトリー
 *
 * @namespace NotificationFactory
 */

import EmailNotification from '../model/notification/email';
import ObjectId from '../model/objectId';

export function createEmail(args: {
    _id?: ObjectId,
    // tslint:disable-next-line:no-reserved-keywords
    from: string,
    to: string,
    subject: string,
    content: string
}) {
    return new EmailNotification(
        (args._id === undefined) ? ObjectId() : (args._id),
        args.from,
        args.to,
        args.subject,
        args.content
    );
}
