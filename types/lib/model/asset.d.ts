/// <reference types="mongoose" />
import AssetGroup from "./assetGroup";
import Authorization from "./authorization";
import ObjectId from "./objectId";
import Ownership from "./ownership";
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
export default class Asset {
    readonly _id: ObjectId;
    readonly group: AssetGroup;
    readonly ownership: Ownership;
    readonly price: number;
    readonly authorizations: Authorization[];
    constructor(_id: ObjectId, group: AssetGroup, ownership: Ownership, price: number, authorizations: Authorization[]);
}
