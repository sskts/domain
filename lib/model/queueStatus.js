/**
 * キューステータス
 *
 * @namespace QueueStatus
 */
"use strict";
var QueueStatus;
(function (QueueStatus) {
    /**
     * 未実行
     */
    QueueStatus.UNEXECUTED = 'UNEXECUTED';
    /**
     * 実行中
     */
    QueueStatus.RUNNING = 'RUNNING';
    /**
     * 実行済
     */
    QueueStatus.EXECUTED = 'EXECUTED';
    /**
     * 実行中止
     */
    QueueStatus.ABORTED = 'ABORTED';
})(QueueStatus || (QueueStatus = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueueStatus;
