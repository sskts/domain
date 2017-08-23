"use strict";
/**
 * 取引タスクエクスポートステータス
 *
 * @namespace factory/transactionTasksExportationStatus
 */
Object.defineProperty(exports, "__esModule", { value: true });
var TransactionTasksExportationStatus;
(function (TransactionTasksExportationStatus) {
    /**
     * 未エクスポート
     */
    TransactionTasksExportationStatus["Unexported"] = "Unexported";
    /**
     * エクスポート中
     */
    TransactionTasksExportationStatus["Exporting"] = "Exporting";
    /**
     * エクスポート済
     */
    TransactionTasksExportationStatus["Exported"] = "Exported";
})(TransactionTasksExportationStatus || (TransactionTasksExportationStatus = {}));
exports.default = TransactionTasksExportationStatus;
