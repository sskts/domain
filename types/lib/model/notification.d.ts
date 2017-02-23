/**
 * 通知
 *
 * @class Notification
 *
 * @param {string} id
 * @param {string} group 通知グループ
 */
declare class Notification {
    readonly id: string;
    readonly group: string;
    constructor(id: string, group: string);
}
declare namespace Notification {
    /**
     * Eメール通知
     *
     * @class EmailNotification
     * @extends {Notification}
     * @param {string} id
     * @param {string} from
     * @param {string} to
     * @param {string} subject
     * @param {string} content
     */
    class EmailNotification extends Notification {
        readonly id: string;
        readonly from: string;
        readonly to: string;
        readonly subject: string;
        readonly content: string;
        constructor(id: string, from: string, to: string, subject: string, content: string);
    }
    interface IEmailNotification {
        id?: string;
        from: string;
        to: string;
        subject: string;
        content: string;
    }
    function createEmail(args: IEmailNotification): EmailNotification;
}
export default Notification;
