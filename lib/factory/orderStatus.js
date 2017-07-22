"use strict";
/**
 * 注文ステータス
 *
 * @namespace factory/orderStatus
 */
Object.defineProperty(exports, "__esModule", { value: true });
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["OrderCancelled"] = "OrderCancelled";
    OrderStatus["OrderDelivered"] = "OrderDelivered";
    OrderStatus["OrderInTransit"] = "OrderInTransit";
    OrderStatus["OrderPaymentDue"] = "OrderPaymentDue";
    OrderStatus["OrderPickupAvailable"] = "OrderPickupAvailable";
    OrderStatus["OrderProblem"] = "OrderProblem";
    OrderStatus["OrderProcessing"] = "OrderProcessing";
    OrderStatus["OrderReturned"] = "OrderReturned";
})(OrderStatus || (OrderStatus = {}));
exports.default = OrderStatus;
