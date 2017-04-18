/**
 * 所有権インターフェース
 *
 * @param {string} id
 * @param {string} owner 所有者
 * @param {boolean} authenticated 認証済みかどうか
 * @memberof tobereplaced$
 */
export interface IOwnership {
    id: string;
    owner: string;
    authenticated: boolean;
}
/**
 *
 * @memberof tobereplaced$
 */
export declare function create(args: {
    id?: string;
    owner: string;
    authenticated: boolean;
}): IOwnership;
