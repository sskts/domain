import MultilingualString from "../multilingualString";
import ObjectId from "../objectId";
import Owner from "../owner";
import OwnerGroup from "../ownerGroup";

/**
 * 興行所有者
 *
 *
 * @class PromoterOwner
 * @extends {Owner}
 */
export default class PromoterOwner extends Owner {
    /**
     * Creates an instance of PromoterOwner.
     *
     * @param {ObjectId} _id
     * @param {MultilingualString} name
     *
     * @memberOf PromoterOwner
     */
    constructor(
        readonly _id: ObjectId,
        readonly name: MultilingualString
    ) {
        super(_id, OwnerGroup.PROMOTER);

        // todo validation
    }
}