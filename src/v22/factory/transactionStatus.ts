/**
 * 取引ステータス
 *
 * @namespace factory/transactionStatus
 */

enum TransactionStatus {
    /**
     * 進行中
     */
    UNDERWAY = 'UNDERWAY',
    /**
     * 成立済み
     */
    CLOSED = 'CLOSED',
    /**
     * 期限切れ
     */
    EXPIRED = 'EXPIRED'
}

export default TransactionStatus;
