/**
 * キューステータス
 *
 * @namespace QueueStatus
 */
declare type QueueStatus = 'UNEXECUTED' | 'RUNNING' | 'EXECUTED' | 'ABORTED';
declare namespace QueueStatus {
    /**
     * 未実行
     */
    const UNEXECUTED = "UNEXECUTED";
    /**
     * 実行中
     */
    const RUNNING = "RUNNING";
    /**
     * 実行済
     */
    const EXECUTED = "EXECUTED";
    /**
     * 実行中止
     */
    const ABORTED = "ABORTED";
}
export default QueueStatus;
