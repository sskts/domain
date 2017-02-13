/**
 * キューグループ
 *
 * @namespace QueueGroup
 */
"use strict";
var QueueGroup;
(function (QueueGroup) {
    /**
     * 資産移動
     */
    QueueGroup.SETTLE_AUTHORIZATION = "SETTLE_AUTHORIZATION";
    /**
     * 資産承認解除
     */
    QueueGroup.CANCEL_AUTHORIZATION = "CANCEL_AUTHORIZATION";
    /**
     * 通知送信
     */
    QueueGroup.PUSH_NOTIFICATION = "PUSH_NOTIFICATION";
    /**
     * 取引照会無効化
     */
    QueueGroup.DISABLE_TRANSACTION_INQUIRY = "DISABLE_TRANSACTION_INQUIRY";
})(QueueGroup || (QueueGroup = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueueGroup;
