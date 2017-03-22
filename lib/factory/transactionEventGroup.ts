/**
 * 取引イベントグループ
 *
 * @namespace TransactionEventGroup
 */

type TransactionEventGroup =
    | 'AUTHORIZE'
    | 'UNAUTHORIZE'
    | 'ADD_NOTIFICATION'
    | 'REMOVE_NOTIFICATION'
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
    export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
    /**
     * 通知アイテム削除
     */
    export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
}

export default TransactionEventGroup;
