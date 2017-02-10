"use strict";
/**
 * 所有者
 *
 * @export
 * @class Owner
 */
class Owner {
    /**
     * Creates an instance of Owner.
     *
     * @param {ObjectId} _id
     * @param {OwnerGroup} group 所有者グループ
     */
    constructor(_id, group) {
        this._id = _id;
        this.group = group;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Owner;
