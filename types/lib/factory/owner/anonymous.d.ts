import * as OwnerFactory from '../owner';
/**
 *
 * @interface IAnonymousOwner
 * @extends {OwnerFactory.IOwner}
 * @memberof tobereplaced$
 */
export interface IAnonymousOwner extends OwnerFactory.IOwner {
    id: string;
    name_first: string;
    name_last: string;
    email: string;
    tel: string;
    /**
     * 状態(クライアント側のセッションIDなど、匿名とはいえ何かしら人を特定するためのもの)
     */
    state: string;
}
/**
 * 一般所有者を作成する
 * @memberof tobereplaced$
 */
export declare function create(args: {
    id?: string;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
    state?: string;
}): IAnonymousOwner;
