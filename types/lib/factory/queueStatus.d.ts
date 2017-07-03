/**
 * キューステータス
 *
 * @namespace factory/queueStatus
 */
declare enum QueueStatus {
    /**
     * 未実行
     */
    UNEXECUTED = "UNEXECUTED",
    /**
     * 実行中
     */
    RUNNING = "RUNNING",
    /**
     * 実行済
     */
    EXECUTED = "EXECUTED",
    /**
     * 実行中止
     */
    ABORTED = "ABORTED",
}
export default QueueStatus;
