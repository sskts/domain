"use strict";
/**
 * 所有者
 *
 * @class Owner
 *
 * @param {ObjectId} _id
 * @param {OwnerGroup} group 所有者グループ
 */
class Owner {
    constructor(_id, group) {
        this._id = _id;
        this.group = group;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Owner;
