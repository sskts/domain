/// <reference types="mongoose" />
import MultilingualString from "../multilingualString";
import ObjectId from "../objectId";
import Owner from "../owner";
/**
 * 興行所有者
 *
 *
 * @class PromoterOwner
 * @extends {Owner}
 */
export default class PromoterOwner extends Owner {
    readonly _id: ObjectId;
    readonly name: MultilingualString;
    /**
     * Creates an instance of PromoterOwner.
     *
     * @param {ObjectId} _id
     * @param {MultilingualString} name
     *
     * @memberOf PromoterOwner
     */
    constructor(_id: ObjectId, name: MultilingualString);
}
