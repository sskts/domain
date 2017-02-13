/**
 * 取引キューステータス
 *
 * @namespace TransactionQueuesStatus
 */
"use strict";
var TransactionQueuesStatus;
(function (TransactionQueuesStatus) {
    /**
     * 未エクスポート
     */
    TransactionQueuesStatus.UNEXPORTED = 'UNEXPORTED';
    /**
     * エクスポート中
     */
    TransactionQueuesStatus.EXPORTING = 'EXPORTING';
    /**
     * エクスポート済
     */
    TransactionQueuesStatus.EXPORTED = 'EXPORTED';
})(TransactionQueuesStatus || (TransactionQueuesStatus = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionQueuesStatus;
