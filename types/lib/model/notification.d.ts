import ObjectId from './objectId';
/**
 * 通知
 *
 * @class Notification
 *
 * @param {ObjectId} _id
 * @param {string} group 通知グループ
 */
declare class Notification {
    readonly _id: ObjectId;
    readonly group: string;
    constructor(_id: ObjectId, group: string);
}
declare namespace Notification {
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
    class EmailNotification extends Notification {
        readonly _id: ObjectId;
        readonly from: string;
        readonly to: string;
        readonly subject: string;
        readonly content: string;
        constructor(_id: ObjectId, from: string, to: string, subject: string, content: string);
    }
    interface IEmailNotification {
        _id?: ObjectId;
        from: string;
        to: string;
        subject: string;
        content: string;
    }
    function createEmail(args: IEmailNotification): EmailNotification;
}
export default Notification;
