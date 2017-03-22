/**
 * 取引イベントグループ
 *
 * @namespace TransactionEventGroup
 */
declare type TransactionEventGroup = 'AUTHORIZE' | 'UNAUTHORIZE' | 'ADD_NOTIFICATION' | 'REMOVE_NOTIFICATION';
declare namespace TransactionEventGroup {
    /**
     * オーソリアイテム追加
     */
    const AUTHORIZE = "AUTHORIZE";
    /**
     * オーソリアイテム削除
     */
    const UNAUTHORIZE = "UNAUTHORIZE";
    /**
     * 通知アイテム追加
     */
    const ADD_NOTIFICATION = "ADD_NOTIFICATION";
    /**
     * 通知アイテム削除
     */
    const REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION";
}
export default TransactionEventGroup;
