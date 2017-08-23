/**
 * 通知ファクトリー
 *
 * @namespace factory/notification
 */
/**
 * 通知インターフェース
 *
 * @interface INotification
 * @param {string} id
 * @param {string} group 通知グループ
 * @memberof tobereplaced$
 */
export interface INotification {
    id: string;
    group: string;
}
