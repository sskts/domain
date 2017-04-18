/**
 * 取引ステータス
 *
 * @namespace factory/transactionStatus
 */
declare type TransactionStatus = 'READY' | 'UNDERWAY' | 'CLOSED' | 'EXPIRED';
declare namespace TransactionStatus {
    /**
     * 開始待機
     */
    const READY = "READY";
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
