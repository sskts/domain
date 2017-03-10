/**
 * 取引イベントグループ
 *
 * @namespace TransactionEventGroup
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TransactionEventGroup;
(function (TransactionEventGroup) {
    /**
     * オーソリアイテム追加
     */
    TransactionEventGroup.AUTHORIZE = 'AUTHORIZE';
    /**
     * オーソリアイテム削除
     */
    TransactionEventGroup.UNAUTHORIZE = 'UNAUTHORIZE';
    /**
     * 通知アイテム追加
     */
    TransactionEventGroup.NOTIFICATION_ADD = 'NOTIFICATION_ADD';
    /**
     * 通知アイテム削除
     */
    TransactionEventGroup.NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE';
})(TransactionEventGroup || (TransactionEventGroup = {}));
exports.default = TransactionEventGroup;
