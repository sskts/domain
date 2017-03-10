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
export declare function create(args: {
    id?: string;
    owner: string;
    authenticated: boolean;
}): IOwnership;
