/**
 * 取引キューステータス
 *
 * @namespace factory/transactionQueuesStatus
 */
declare enum TransactionQueuesStatus {
    /**
     * 未エクスポート
     */
    UNEXPORTED = "UNEXPORTED",
    /**
     * エクスポート中
     */
    EXPORTING = "EXPORTING",
    /**
     * エクスポート済
     */
    EXPORTED = "EXPORTED",
}
export default TransactionQueuesStatus;
