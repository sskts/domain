"use strict";
/**
 * 承認
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @export
 * @class Authorization
 */
class Authorization {
    /**
     * Creates an instance of Authorization.
     *
     * @param {ObjectId} _id
     * @param {AuthorizationGroup} group 承認グループ
     * @param {number} price 承認価格
     * @param {ObjectId} owner_from 資産を差し出す所有者
     * @param {ObjectId} owner_to 資産を受け取る所有者
     */
    constructor(_id, group, price, owner_from, owner_to) {
        this._id = _id;
        this.group = group;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Authorization;
