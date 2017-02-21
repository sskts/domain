// tslint:disable:variable-name
import * as validator from 'validator';
import NotificationGroup from './notificationGroup';
import ObjectId from './objectId';

/**
 * 通知
 *
 * @class Notification
 *
 * @param {ObjectId} _id
 * @param {string} group 通知グループ
 */
class Notification {
    constructor(
        readonly _id: ObjectId,
        readonly group: string
    ) {
        // todo validation
    }
}

namespace Notification {
    /**
     * Eメール通知
     *
     * @class EmailNotification
     * @extends {Notification}
     * @param {ObjectId} _id
     * @param {string} from
     * @param {string} to
     * @param {string} subject
     * @param {string} content
     */
    // tslint:disable-next-line:max-classes-per-file
    export class EmailNotification extends Notification {
        constructor(
            readonly _id: ObjectId,
            // tslint:disable-next-line:no-reserved-keywords
            readonly from: string,
            readonly to: string,
            readonly subject: string,
            readonly content: string
        ) {
            super(_id, NotificationGroup.EMAIL);

            // todo validation
            if (validator.isEmpty(from)) throw new Error('from required.');
            if (validator.isEmpty(to)) throw new Error('to required.');
            if (validator.isEmpty(subject)) throw new Error('subject required.');
            if (validator.isEmpty(content)) throw new Error('content required.');
        }
    }

    export interface IEmailNotification {
        _id?: ObjectId;
        // tslint:disable-next-line:no-reserved-keywords
        from: string;
        to: string;
        subject: string;
        content: string;
    }

    export function createEmail(args: IEmailNotification) {
        return new EmailNotification(
            (args._id === undefined) ? ObjectId() : (args._id),
            args.from,
            args.to,
            args.subject,
            args.content
        );
    }
}

export default Notification;
