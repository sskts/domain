import ObjectId from "../model/objectId";
import Ownership from "../model/ownership";

/**
 * 所有権ファクトリー
 *
 * @namespace
 */
namespace OwnershipFactory {
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
}

export default OwnershipFactory;