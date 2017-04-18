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
}): IAnonymousOwner;
