"use strict";
const authorization_1 = require("../authorization");
const authorizationGroup_1 = require("../authorizationGroup");
/**
 * 資産承認
 * 誰が、誰に対して、何(資産)の所有を、承認するのか
 *
 * @export
 * @class AssetAuthorization
 * @extends {Authorization}
 */
class AssetAuthorization extends authorization_1.default {
    /**
     * Creates an instance of AssetAuthorization.
     *
     * @param {ObjectId} _id
     * @param {Asset} asset 資産
     * @param {number} price 資産価格
     * @param {ObjectId} owner_from 誰が
     * @param {ObjectId} owner_to 誰に対して
     *
     * @memberOf AssetAuthorization
     */
    constructor(_id, asset, price, owner_from, owner_to) {
        super(_id, authorizationGroup_1.default.ASSET, price, owner_from, owner_to);
        this._id = _id;
        this.asset = asset;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AssetAuthorization;
