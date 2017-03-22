import * as NotificationFactory from '../notification';
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
    from: string;
    to: string;
    subject: string;
    content: string;
}
export declare function create(args: {
    id?: string;
    from: string;
    to: string;
    subject: string;
    content: string;
}): IEmailNotification;
