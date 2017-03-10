/**
 * 所有者ファクトリー
 *
 * @namespace OwnerFacroty
 *
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
        id: (args.id) ? args.id : ObjectId().toString(),
        group: OwnerGroup.ANONYMOUS,
        name_first: (args.name_first) ? args.name_first : '',
        name_last: (args.name_last) ? args.name_last : '',
        email: (args.email) ? args.email : '',
        tel: (args.tel) ? args.tel : ''
    };
}

/**
 * 興行所有者オブジェクトを作成する
 *
 * @export
 * @param {{
 *     id?: string;
 *     name?: MultilingualString;
 * }} args
 * @returns {IPromoterOwner}
 */
export function createPromoter(args: {
    id?: string;
    name?: MultilingualString;
}): IPromoterOwner {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: OwnerGroup.PROMOTER,
        name: (args.name) ? args.name : { ja: '', en: '' }
    };
}
