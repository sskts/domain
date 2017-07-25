"use strict";
/**
 * 取引ステータス
 *
 * @namespace factory/transactionStatusType
 */
Object.defineProperty(exports, "__esModule", { value: true });
var TransactionStatusType;
(function (TransactionStatusType) {
    TransactionStatusType["InProgress"] = "InProgress";
    TransactionStatusType["Canceled"] = "Canceled";
    TransactionStatusType["Confirmed"] = "Confirmed";
    TransactionStatusType["Expired"] = "Expired";
})(TransactionStatusType || (TransactionStatusType = {}));
exports.default = TransactionStatusType;
