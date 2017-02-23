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
declare class Ownership {
    readonly id: string;
    readonly owner: string;
    readonly authenticated: boolean;
    constructor(id: string, owner: string, authenticated: boolean);
}
declare namespace Ownership {
    interface IOwnership {
        id?: string;
        owner: string;
        authenticated: boolean;
    }
    function create(args: IOwnership): Ownership;
}
export default Ownership;
