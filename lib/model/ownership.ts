// tslint:disable:variable-name
import ObjectId from './objectId';

/**
 * 所有権
 * 誰が、何を、所有するのか
 *
 * @class Ownership
 *
 * @param {ObjectId} _id
 * @param {ObjectId} owner 所有者
 * @param {boolean} authenticated 認証済みかどうか
 */
class Ownership {
    constructor(
        readonly _id: ObjectId,
        readonly owner: ObjectId,
        readonly authenticated: boolean
    ) {
        // todo validation
    }
}

namespace Ownership {
    export interface IOwnership {
        _id?: ObjectId;
        owner: ObjectId;
        authenticated: boolean;
    }

    export function create(args: IOwnership) {
        return new Ownership(
            (args._id) ? args._id : ObjectId(),
            args.owner,
            args.authenticated
        );
    }
}

export default Ownership;
