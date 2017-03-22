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
    TransactionEventGroup.ADD_NOTIFICATION = 'ADD_NOTIFICATION';
    /**
     * 通知アイテム削除
     */
    TransactionEventGroup.REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
})(TransactionEventGroup || (TransactionEventGroup = {}));
exports.default = TransactionEventGroup;
