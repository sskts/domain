/**
 * 取引ステータス
 *
 * @namespace TransactionStatus
 */
declare type TransactionStatus = "UNDERWAY" | "CLOSED" | "EXPIRED";
declare namespace TransactionStatus {
    /**
     * 進行中
     */
    const UNDERWAY = "UNDERWAY";
    /**
     * 成立済み
     */
    const CLOSED = "CLOSED";
    /**
     * 期限切れ
     */
    const EXPIRED = "EXPIRED";
}
export default TransactionStatus;
