/**
 * Eメール通知ファクトリー
 *
 * @namespace EmailNotificationFactory
 */
import * as validator from 'validator';
import * as NotificationFactory from '../notification';
import NotificationGroup from '../notificationGroup';
import ObjectId from '../objectId';

/**
 * Eメール通知インターフェース
 *
 * @param {string} id
 * @param {string} from
 * @param {string} to
 * @param {string} subject
 * @param {string} content
 */
export interface IEmailNotification extends NotificationFactory.INotification {
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}

export function create(args: {
    id?: string,
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}): IEmailNotification {
    // todo validation
    if (validator.isEmpty(args.from)) throw new RangeError('from required.');
    if (validator.isEmpty(args.to)) throw new RangeError('to required.');
    if (validator.isEmpty(args.subject)) throw new RangeError('subject required.');
    if (validator.isEmpty(args.content)) throw new RangeError('content required.');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : (args.id),
        group: NotificationGroup.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content
    };
}
