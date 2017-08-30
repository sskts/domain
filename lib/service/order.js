"use strict";
/**
 * order service
 * @namespace service/order
 */
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
function createFromTransaction(transactionId) {
    return (orderAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionAdapter.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new factory.errors.Argument('transactionId', `transaction[${transactionId}] not found.`);
        }
        if (transaction.result !== undefined) {
            const order = transaction.result.order;
            yield orderAdapter.orderModel.findOneAndUpdate({
                orderNumber: order.orderNumber
            }, order, { upsert: true }).exec();
        }
    });
}
exports.createFromTransaction = createFromTransaction;
/**
 * find an order by an inquiry key
 * @param {factory.order.IOrderInquiryKey} orderInquiryKey
 */
function findByOrderInquiryKey(orderInquiryKey) {
    return (orderAdapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield orderAdapter.orderModel.findOne({
            'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
            'orderInquiryKey.confirmationNumber': orderInquiryKey.confirmationNumber,
            'orderInquiryKey.telephone': orderInquiryKey.telephone
        }).exec();
        if (doc === null) {
            throw new factory.errors.NotFound('order');
        }
        return doc.toObject();
    });
}
exports.findByOrderInquiryKey = findByOrderInquiryKey;
