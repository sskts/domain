"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_1 = require("./mongoose/model/transaction");
const transactionEvent_1 = require("./mongoose/model/transactionEvent");
/**
 * 取引アダプター
 *
 * @class TransactionAdapter
 */
class TransactionAdapter {
    constructor(connection) {
        this.transactionModel = connection.model(transaction_1.default.modelName);
        this.transactionEventModel = connection.model(transactionEvent_1.default.modelName);
    }
}
exports.default = TransactionAdapter;
