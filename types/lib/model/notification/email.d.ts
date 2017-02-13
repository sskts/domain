/// <reference types="mongoose" />
import Notification from '../notification';
import ObjectId from '../objectId';
/**
 * Eメール通知
 *
 *
 * @class EmailNotification
 * @extends {Notification}
 */
export default class EmailNotification extends Notification {
    readonly _id: ObjectId;
    readonly from: string;
    readonly to: string;
    readonly subject: string;
    readonly content: string;
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
    constructor(_id: ObjectId, from: string, to: string, subject: string, content: string);
}
