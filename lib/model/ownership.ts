// tslint:disable:variable-name
import ObjectId from './objectId';

/**
 * 所有権
 * 誰が、何を、所有するのか
 *
 * @class Ownership
 *
 * @param {string} id
 * @param {string} owner 所有者
 * @param {boolean} authenticated 認証済みかどうか
 */
class Ownership {
    constructor(
        readonly id: string,
        readonly owner: string,
        readonly authenticated: boolean
    ) {
        // todo validation
    }
}

namespace Ownership {
    export interface IOwnership {
        id?: string;
        owner: string;
        authenticated: boolean;
    }

    export function create(args: IOwnership) {
        return new Ownership(
            (args.id) ? args.id : ObjectId().toString(),
            args.owner,
            args.authenticated
        );
    }
}

export default Ownership;
