/**
 * 承認ファクトリー
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @namespace factory/authorization
 */

import AuthorizationGroup from './authorizationGroup';

export enum OwnerType {
    Organization = 'Organization',
    Person = 'Person'
}

export interface IOwner {
    typeOf: string;
    id: string;
    name: string;
}

/**
 * 承認インターフェース
 *
 * @interface IAuthorization
 * @param {string} id
 * @param {Asset} asset 資産
 * @param {number} price 資産価格
 * @param {any} agent 誰が
 * @param {any} recipient 誰に対して
 * @param {any} object 何を
 * @param {any} result The result produced in the action.
 * @memberof tobereplaced$
 */
export interface IAuthorization {
    id: string;
    group: AuthorizationGroup;
    price: number;
    agent: IOwner;
    recipient: IOwner;
    object: any;
    result: any;
}
