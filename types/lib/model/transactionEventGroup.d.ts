/**
 * 取引イベントグループ
 *
 * @namespace TransactionEventGroup
 */
declare type TransactionEventGroup = 'AUTHORIZE' | 'UNAUTHORIZE' | 'NOTIFICATION_ADD' | 'NOTIFICATION_REMOVE';
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
    const NOTIFICATION_ADD = "NOTIFICATION_ADD";
    /**
     * 通知アイテム削除
     */
    const NOTIFICATION_REMOVE = "NOTIFICATION_REMOVE";
}
export default TransactionEventGroup;
