/**
 * 取引イベントグループ
 *
 * @namespace factory/transactionEventGroup
 */
declare enum TransactionEventGroup {
    /**
     * オーソリアイテム追加
     */
    AUTHORIZE = "AUTHORIZE",
    /**
     * オーソリアイテム削除
     */
    UNAUTHORIZE = "UNAUTHORIZE",
    /**
     * 通知アイテム追加
     */
    ADD_NOTIFICATION = "ADD_NOTIFICATION",
    /**
     * 通知アイテム削除
     */
    REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION",
}
export default TransactionEventGroup;
