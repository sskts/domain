"use strict";
/**
 * 商品在庫状況
 *
 * @namespace factory/itemAvailability
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ItemAvailability;
(function (ItemAvailability) {
    ItemAvailability["Discontinued"] = "Discontinued";
    ItemAvailability["InStock"] = "InStock";
    ItemAvailability["InStoreOnly"] = "InStoreOnly";
    ItemAvailability["LimitedAvailability"] = "LimitedAvailability";
    ItemAvailability["OnlineOnly"] = "OnlineOnly";
    ItemAvailability["OutOfStock"] = "OutOfStock";
    ItemAvailability["PreOrder"] = "PreOrder";
    ItemAvailability["PreSale"] = "PreSale";
    ItemAvailability["SoldOut"] = "SoldOut";
})(ItemAvailability || (ItemAvailability = {}));
exports.default = ItemAvailability;
