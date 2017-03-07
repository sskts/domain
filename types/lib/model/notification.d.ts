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
    from: string;
    to: string;
    subject: string;
    content: string;
}
export declare function createEmail(args: {
    id?: string;
    from: string;
    to: string;
    subject: string;
    content: string;
}): IEmailNotification;
