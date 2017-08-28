"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const factory = require("@motionpicture/sskts-factory");
const transaction_1 = require("./mongoose/model/transaction");
/**
 * transaction adapter
 * @class
 */
class TransactionAdapter {
    constructor(connection) {
        this.transactionModel = connection.model(transaction_1.default.modelName);
    }
    /**
     * find placeOrder transaction by id
     * @param {string} transactionId transaction id
     */
    findPlaceOrderById(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transactionModel.findOne({
                _id: transactionId,
                typeOf: factory.transactionType.PlaceOrder
            }).exec()
                .then((doc) => {
                return (doc === null) ? null : doc.toObject();
            });
        });
    }
}
exports.default = TransactionAdapter;
