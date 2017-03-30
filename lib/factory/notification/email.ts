/**
 * Eメール通知ファクトリー
 *
 * @namespace EmailNotificationFactory
 */
import * as _ from 'underscore';
import * as validator from 'validator';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

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
    if (_.isEmpty(args.from)) throw new ArgumentNullError('from');
    if (_.isEmpty(args.to)) throw new ArgumentNullError('to');
    if (_.isEmpty(args.subject)) throw new ArgumentNullError('subject');
    if (_.isEmpty(args.content)) throw new ArgumentNullError('content');

    if (!validator.isEmail(args.from)) throw new ArgumentError('from', 'from should be email');
    if (!validator.isEmail(args.to)) throw new ArgumentError('to', 'to should be email');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: NotificationGroup.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content
    };
}
