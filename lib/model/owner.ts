// tslint:disable:variable-name
import ObjectId from './objectId';
import OwnerGroup from './ownerGroup';

/**
 * 所有者
 *
 * @class Owner
 *
 * @param {ObjectId} _id
 * @param {OwnerGroup} group 所有者グループ
 */
export default class Owner {
    constructor(
        readonly _id: ObjectId,
        readonly group: OwnerGroup
    ) {
        // todo validation
    }
}
