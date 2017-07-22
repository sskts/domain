"use strict";
/**
 * 取引タスクエクスポートステータス
 *
 * @namespace factory/actionTasksExportationStatus
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ActionTasksExportationStatus;
(function (ActionTasksExportationStatus) {
    /**
     * 未エクスポート
     */
    ActionTasksExportationStatus["Unexported"] = "Unexported";
    /**
     * エクスポート中
     */
    ActionTasksExportationStatus["Exporting"] = "Exporting";
    /**
     * エクスポート済
     */
    ActionTasksExportationStatus["Exported"] = "Exported";
})(ActionTasksExportationStatus || (ActionTasksExportationStatus = {}));
exports.default = ActionTasksExportationStatus;
