/**
 * 所有権ファクトリー
 * 誰が、何を、所有するのか
 *
 * @namespace AssetFacroty
 */

import ObjectId from './objectId';

/**
 * 所有権インターフェース
 *
 * @param {string} id
 * @param {string} owner 所有者
 * @param {boolean} authenticated 認証済みかどうか
 */
export interface IOwnership {
    id: string;
    owner: string;
    authenticated: boolean;
}

export function create(args: {
    id?: string,
    owner: string,
    authenticated: boolean
}): IOwnership {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        owner: args.owner,
        authenticated: args.authenticated
    };
}
