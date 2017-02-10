/**
 * 取引キューステータス
 *
 * @namespace TransactionQueuesStatus
 */
declare type TransactionQueuesStatus = "UNEXPORTED" | "EXPORTING" | "EXPORTED";
declare namespace TransactionQueuesStatus {
    /** 未エクスポート */
    const UNEXPORTED = "UNEXPORTED";
    /** エクスポート中 */
    const EXPORTING = "EXPORTING";
    /** エクスポート済 */
    const EXPORTED = "EXPORTED";
}
export default TransactionQueuesStatus;
