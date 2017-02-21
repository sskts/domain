/**
 * 取引イベントグループ
 *
 * @namespace TransactionEventGroup
 */

type TransactionEventGroup =
    | 'AUTHORIZE'
    | 'UNAUTHORIZE'
    | 'NOTIFICATION_ADD'
    | 'NOTIFICATION_REMOVE'
    ;

namespace TransactionEventGroup {
    /**
     * オーソリアイテム追加
     */
    export const AUTHORIZE = 'AUTHORIZE';
    /**
     * オーソリアイテム削除
     */
    export const UNAUTHORIZE = 'UNAUTHORIZE';
    /**
     * 通知アイテム追加
     */
    export const NOTIFICATION_ADD = 'NOTIFICATION_ADD';
    /**
     * 通知アイテム削除
     */
    export const NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE';
}

export default TransactionEventGroup;
