/**
 * 所有者ファクトリー
 *
 * @namespace OwnerFacroty
 */
import MultilingualString from '../factory/multilingualString';
import ObjectId from './objectId';
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
export function createAnonymous(args: {
    id?: string;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
}): IAnonymousOwner {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: OwnerGroup.ANONYMOUS,
        name_first: (args.name_first === undefined) ? '' : args.name_first,
        name_last: (args.name_last === undefined) ? '' : args.name_last,
        email: (args.email === undefined) ? '' : args.email,
        tel: (args.tel === undefined) ? '' : args.tel
    };
}

/**
 * 興行所有者オブジェクトを作成する
 *
 * @export
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @returns {IPromoterOwner}
 */
export function createPromoter(args: {
    id?: string;
    name?: MultilingualString;
}): IPromoterOwner {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: OwnerGroup.PROMOTER,
        name: (args.name === undefined) ? { ja: '', en: '' } : args.name
    };
}
