/**
 * 所有権ファクトリー
 *
 * @namespace OwnershipFactory
 */

import ObjectId from "../model/objectId";
import Ownership from "../model/ownership";

export function create(args: {
    _id?: ObjectId,
    owner: ObjectId,
    authenticated: boolean,
}) {
    return new Ownership(
        (args._id) ? args._id : ObjectId(),
        args.owner,
        args.authenticated,
    );
}
