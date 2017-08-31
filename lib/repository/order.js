"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
}
exports.default = OrderRepository;
