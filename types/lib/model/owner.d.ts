/// <reference types="mongoose" />
import ObjectId from "./objectId";
import OwnerGroup from "./ownerGroup";
/**
 * 所有者
 *
 * @export
 * @class Owner
 */
export default class Owner {
    readonly _id: ObjectId;
    readonly group: OwnerGroup;
    /**
     * Creates an instance of Owner.
     *
     * @param {ObjectId} _id
     * @param {OwnerGroup} group 所有者グループ
     */
    constructor(_id: ObjectId, group: OwnerGroup);
}
