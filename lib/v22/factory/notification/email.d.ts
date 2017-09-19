import * as NotificationFactory from '../notification';
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
export declare function create(args: {
    id?: string;
    from: string;
    to: string;
    subject: string;
    content: string;
    send_at?: Date;
}): INotification;
