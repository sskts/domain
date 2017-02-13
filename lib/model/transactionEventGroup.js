/**
 * 取引イベントグループ
 *
 * @namespace TransactionEventGroup
 */
"use strict";
var TransactionEventGroup;
(function (TransactionEventGroup) {
    /**
     * 開始
     */
    TransactionEventGroup.START = 'START';
    /**
     * 成立
     */
    TransactionEventGroup.CLOSE = 'CLOSE';
    /**
     * 期限切れ
     */
    TransactionEventGroup.EXPIRE = 'EXPIRE';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEventGroup;
