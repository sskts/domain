/**
 * アクションイベントタイプ
 *
 * @namespace factory/actionEventType
 */
declare enum ActionEventType {
    /**
     * オーソリアイテム追加
     */
    Authorize = "Authorize",
    /**
     * オーソリアイテム削除
     */
    Unauthorize = "Unauthorize",
    /**
     * 通知アイテム追加
     */
    AddNotification = "AddNotification",
    /**
     * 通知アイテム削除
     */
    RemoveNotification = "RemoveNotification",
}
export default ActionEventType;
