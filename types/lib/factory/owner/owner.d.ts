/**
 * 興行所有者ファクトリー
 *
 * @namespace PromoterOwnerFacroty
 */
import MultilingualString from '../../factory/multilingualString';
import * as OwnerFactory from '../owner';
export interface IPromoterOwner extends OwnerFactory.IOwner {
    id: string;
    name: MultilingualString;
}
/**
 * 興行所有者オブジェクトを作成する
 *
 * @export
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @returns {IPromoterOwner}
 */
export declare function create(args: {
    id?: string;
    name?: MultilingualString;
}): IPromoterOwner;
