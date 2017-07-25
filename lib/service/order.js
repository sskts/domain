"use strict";
/**
 * 注文サービス
 *
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
const monapt = require("monapt");
const orderStatus_1 = require("../factory/orderStatus");
function createFromTransaction(transaction) {
    return (orderAdapter) => __awaiter(this, void 0, void 0, function* () {
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
 * 注文内容を照会する
 */
function makeInquiry(orderInquiryKey) {
    return (orderAdapter) => __awaiter(this, void 0, void 0, function* () {
        return yield orderAdapter.orderModel.findOne({
            'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
            'orderInquiryKey.orderNumber': orderInquiryKey.orderNumber,
            'orderInquiryKey.telephone': orderInquiryKey.telephone,
            orderStatus: orderStatus_1.default.OrderDelivered
        }, 'result').exec()
            .then((doc) => (doc === null) ? monapt.None : monapt.Option(doc.toObject()));
    });
}
exports.makeInquiry = makeInquiry;
