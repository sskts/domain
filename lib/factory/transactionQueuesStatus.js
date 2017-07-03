"use strict";
/**
 * 取引キューステータス
 *
 * @namespace factory/transactionQueuesStatus
 */
Object.defineProperty(exports, "__esModule", { value: true });
var TransactionQueuesStatus;
(function (TransactionQueuesStatus) {
    /**
     * 未エクスポート
     */
    TransactionQueuesStatus["UNEXPORTED"] = "UNEXPORTED";
    /**
     * エクスポート中
     */
    TransactionQueuesStatus["EXPORTING"] = "EXPORTING";
    /**
     * エクスポート済
     */
    TransactionQueuesStatus["EXPORTED"] = "EXPORTED";
})(TransactionQueuesStatus || (TransactionQueuesStatus = {}));
exports.default = TransactionQueuesStatus;
