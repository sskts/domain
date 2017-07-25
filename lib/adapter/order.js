"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("./mongoose/model/order");
/**
 * 注文アダプター
 *
 * @class OrderAdapter
 */
class OrderAdapter {
    constructor(connection) {
        this.orderModel = connection.model(order_1.default.modelName);
    }
}
exports.default = OrderAdapter;
