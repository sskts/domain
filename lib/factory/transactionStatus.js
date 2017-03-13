/**
 * 取引ステータス
 *
 * @namespace TransactionStatus
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TransactionStatus;
(function (TransactionStatus) {
    /**
     * 開始待機
     */
    TransactionStatus.READY = 'READY';
    /**
     * 進行中
     */
    TransactionStatus.UNDERWAY = 'UNDERWAY';
    /**
     * 成立済み
     */
    TransactionStatus.CLOSED = 'CLOSED';
    /**
     * 期限切れ
     */
    TransactionStatus.EXPIRED = 'EXPIRED';
})(TransactionStatus || (TransactionStatus = {}));
exports.default = TransactionStatus;
