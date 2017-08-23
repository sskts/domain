"use strict";
/**
 * 取引ステータス
 *
 * @namespace factory/transactionStatus
 */
Object.defineProperty(exports, "__esModule", { value: true });
var TransactionStatus;
(function (TransactionStatus) {
    /**
     * 進行中
     */
    TransactionStatus["UNDERWAY"] = "UNDERWAY";
    /**
     * 成立済み
     */
    TransactionStatus["CLOSED"] = "CLOSED";
    /**
     * 期限切れ
     */
    TransactionStatus["EXPIRED"] = "EXPIRED";
})(TransactionStatus || (TransactionStatus = {}));
exports.default = TransactionStatus;
