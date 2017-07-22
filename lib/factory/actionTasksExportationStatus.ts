/**
 * 取引タスクエクスポートステータス
 *
 * @namespace factory/actionTasksExportationStatus
 */

enum ActionTasksExportationStatus {
    /**
     * 未エクスポート
     */
    Unexported = 'Unexported',
    /**
     * エクスポート中
     */
    Exporting = 'Exporting',
    /**
     * エクスポート済
     */
    Exported = 'Exported'
}

export default ActionTasksExportationStatus;
