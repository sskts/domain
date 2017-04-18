/**
 * 興行所有者ファクトリー
 *
 * @namespace factory/owner/promoter
 */

import MultilingualString from '../../factory/multilingualString';
import ObjectId from '../objectId';
import * as OwnerFactory from '../owner';
import OwnerGroup from '../ownerGroup';

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
export function create(args: {
    id?: string;
    name?: MultilingualString;
}): IPromoterOwner {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: OwnerGroup.PROMOTER,
        name: (args.name === undefined) ? { ja: '', en: '' } : args.name
    };
}
