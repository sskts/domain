/**
 * キューグループ
 *
 * @namespace factory/queueGroup
 */
declare enum QueueGroup {
    /**
     * 資産移動
     */
    SETTLE_AUTHORIZATION = "SETTLE_AUTHORIZATION",
    /**
     * 資産承認解除
     */
    CANCEL_AUTHORIZATION = "CANCEL_AUTHORIZATION",
    /**
     * 通知送信
     */
    PUSH_NOTIFICATION = "PUSH_NOTIFICATION",
    /**
     * 取引照会無効化
     */
    DISABLE_TRANSACTION_INQUIRY = "DISABLE_TRANSACTION_INQUIRY",
}
export default QueueGroup;
