"use strict";
/**
 * 資産
 *
 * @class Asset
 *
 * @param {ObjectId} _id ID
 * @param {AssetGroup} group 資産グループ
 * @param {Ownership} ownership 所有権
 * @param {number} price 価格
 * @param {Array<Authorization>} authorizations 承認リスト
 */
class Asset {
    constructor(_id, group, ownership, price, authorizations) {
        this._id = _id;
        this.group = group;
        this.ownership = ownership;
        this.price = price;
        this.authorizations = authorizations;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Asset;
