/**
 * 通知ファクトリー
 *
 * @namespace NotificationFacroty
 */
import * as validator from 'validator';
import NotificationGroup from './notificationGroup';
import ObjectId from './objectId';

/**
 * 通知インターフェース
 *
 * @export
 * @interface INotification
 * @param {string} id
 * @param {string} group 通知グループ
 */
export interface INotification {
    id: string;
    group: string;
}

/**
 * Eメール通知インターフェース
 *
 * @param {string} id
 * @param {string} from
 * @param {string} to
 * @param {string} subject
 * @param {string} content
 */
export interface IEmailNotification extends INotification {
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}

export function createEmail(args: {
    id?: string,
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}): IEmailNotification {
    // todo validation
    if (validator.isEmpty(args.from)) throw new Error('from required.');
    if (validator.isEmpty(args.to)) throw new Error('to required.');
    if (validator.isEmpty(args.subject)) throw new Error('subject required.');
    if (validator.isEmpty(args.content)) throw new Error('content required.');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : (args.id),
        group: NotificationGroup.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content
    };
}
