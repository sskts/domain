"use strict";
const owner_1 = require("../owner");
const ownerGroup_1 = require("../ownerGroup");
/**
 * 興行所有者
 *
 *
 * @class PromoterOwner
 * @extends {Owner}
 */
class PromoterOwner extends owner_1.default {
    /**
     * Creates an instance of PromoterOwner.
     *
     * @param {ObjectId} _id
     * @param {MultilingualString} name
     *
     * @memberOf PromoterOwner
     */
    constructor(_id, name) {
        super(_id, ownerGroup_1.default.PROMOTER);
        this._id = _id;
        this.name = name;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PromoterOwner;
