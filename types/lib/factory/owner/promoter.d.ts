/**
 * 興行所有者ファクトリー
 *
 * @namespace factory/owner/promoter
 */
import MultilingualString from '../../factory/multilingualString';
import * as OwnerFactory from '../owner';
/**
 *
 * @interface IPromoterOwner
 * @extends {OwnerFactory.IOwner}
 * @memberof tobereplaced$
 */
export interface IPromoterOwner extends OwnerFactory.IOwner {
    id: string;
    name: MultilingualString;
}
/**
 * 興行所有者オブジェクトを作成する
 *
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @returns {IPromoterOwner}
 * @memberof tobereplaced$
 */
export declare function create(args: {
    id?: string;
    name?: MultilingualString;
}): IPromoterOwner;
