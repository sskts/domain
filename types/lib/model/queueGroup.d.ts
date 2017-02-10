/**
 * キューグループ
 *
 * @namespace QueueGroup
 */
declare type QueueGroup = "SETTLE_AUTHORIZATION" | "CANCEL_AUTHORIZATION" | "PUSH_NOTIFICATION" | "DISABLE_TRANSACTION_INQUIRY";
declare namespace QueueGroup {
    /** 資産移動 */
    const SETTLE_AUTHORIZATION = "SETTLE_AUTHORIZATION";
    /** 資産承認解除 */
    const CANCEL_AUTHORIZATION = "CANCEL_AUTHORIZATION";
    /** 通知送信 */
    const PUSH_NOTIFICATION = "PUSH_NOTIFICATION";
    /** 取引照会無効化 */
    const DISABLE_TRANSACTION_INQUIRY = "DISABLE_TRANSACTION_INQUIRY";
}
export default QueueGroup;
