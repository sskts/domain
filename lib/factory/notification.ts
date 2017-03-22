/**
 * 通知ファクトリー
 *
 * @namespace NotificationFactory
 */

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
