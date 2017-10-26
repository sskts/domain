/**
 * Eメール通知ファクトリー
 *
 * @namespace factory/notification/email
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
 * @memberof tobereplaced$
 *
 * @param {string} id
 * @param {string} from
 * @param {string} to
 * @param {string} subject
 * @param {string} content
 */
export interface INotification extends NotificationFactory.INotification {
    /**
     * 送信元メールアドレス
     */
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    /**
     * 送信先メールアドレス
     */
    to: string;
    /**
     * 件名
     */
    subject: string;
    /**
     * 本文
     */
    content: string;
    /**
     * 送信予定日時(nullの場合はなるはやで送信)
     */
    send_at: Date;
}

/**
 *
 * @memberof tobereplaced$
 */
export function create(args: {
    id?: string,
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
    send_at?: Date;
}): INotification {
    if (_.isEmpty(args.from)) throw new ArgumentNullError('from');
    if (_.isEmpty(args.to)) throw new ArgumentNullError('to');
    if (_.isEmpty(args.subject)) throw new ArgumentNullError('subject');
    if (_.isEmpty(args.content)) throw new ArgumentNullError('content');

    if (!validator.isEmail(args.from)) throw new ArgumentError('from', 'from should be email');
    if (!validator.isEmail(args.to)) throw new ArgumentError('to', 'to should be email');

    if (args.send_at !== undefined) {
        if (!_.isDate(args.send_at)) throw new ArgumentError('send_at', 'send_at should be Date');
    }

    // todo sendgridの仕様上72時間後までしか設定できないのでバリデーション追加するかもしれない

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: NotificationGroup.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content,
        send_at: (args.send_at === undefined) ? new Date() : args.send_at
    };
}
