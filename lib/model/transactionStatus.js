/**
 * 取引ステータス
 *
 * @namespace TransactionStatus
 */
"use strict";
var TransactionStatus;
(function (TransactionStatus) {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionStatus;
