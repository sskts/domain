"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ownershipInfo_1 = require("./mongoose/model/ownershipInfo");
/**
 * 所有権アダプター
 *
 * @class OwnershipInfoAdapter
 */
class OwnershipInfoAdapter {
    constructor(connection) {
        this.ownershipInfoModel = connection.model(ownershipInfo_1.default.modelName);
    }
}
exports.default = OwnershipInfoAdapter;
