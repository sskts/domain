/**
 * 所有者ファクトリー
 *
 * @namespace OwnerFacroty
 */
import MultilingualString from '../factory/multilingualString';
import OwnerGroup from './ownerGroup';
/**
 * 所有者インターフェース
 *
 * @export
 * @interface IOwner
 * @param {string} id
 * @param {OwnerGroup} group 所有者グループ
 */
export interface IOwner {
    id: string;
    group: OwnerGroup;
}
export interface IAnonymousOwner extends IOwner {
    id: string;
    name_first: string;
    name_last: string;
    email: string;
    tel: string;
}
export interface IPromoterOwner extends IOwner {
    id: string;
    name: MultilingualString;
}
/**
 * 一般所有者を作成する
 */
export declare function createAnonymous(args: {
    id?: string;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
}): IAnonymousOwner;
/**
 * 興行所有者オブジェクトを作成する
 *
 * @export
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @returns {IPromoterOwner}
 */
export declare function createPromoter(args: {
    id?: string;
    name?: MultilingualString;
}): IPromoterOwner;
