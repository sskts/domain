// tslint:disable:variable-name
import * as validator from 'validator';
import Notification from '../notification';
import NotificationGroup from '../notificationGroup';
import ObjectId from '../objectId';

/**
 * Eメール通知
 *
 *
 * @class EmailNotification
 * @extends {Notification}
 */
export default class EmailNotification extends Notification {
    /**
     * Creates an instance of EmailNotification.
     *
     * @param {ObjectId} _id
     * @param {string} from
     * @param {string} to
     * @param {string} subject
     * @param {string} content
     *
     * @memberOf EmailNotification
     */
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
