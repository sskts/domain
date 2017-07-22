"use strict";
/**
 * アクションイベントタイプ
 *
 * @namespace factory/actionEventType
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ActionEventType;
(function (ActionEventType) {
    /**
     * オーソリアイテム追加
     */
    ActionEventType["Authorize"] = "Authorize";
    /**
     * オーソリアイテム削除
     */
    ActionEventType["Unauthorize"] = "Unauthorize";
    /**
     * 通知アイテム追加
     */
    ActionEventType["AddNotification"] = "AddNotification";
    /**
     * 通知アイテム削除
     */
    ActionEventType["RemoveNotification"] = "RemoveNotification";
})(ActionEventType || (ActionEventType = {}));
exports.default = ActionEventType;
