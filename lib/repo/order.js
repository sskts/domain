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
const order_1 = require("./mongoose/model/order");
/**
 * 注文レポジトリー
 *
 * @class OrderRepository
 */
class OrderRepository {
    constructor(connection) {
        this.orderModel = connection.model(order_1.default.modelName);
    }
    /**
     * find an order by an inquiry key
     * @param {factory.order.IOrderInquiryKey} orderInquiryKey
     */
    findByOrderInquiryKey(orderInquiryKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.orderModel.findOne({
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
    save(order) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.orderModel.findOneAndUpdate({
                orderNumber: order.orderNumber
            }, order, { upsert: true }).exec();
        });
    }
}
exports.default = OrderRepository;
