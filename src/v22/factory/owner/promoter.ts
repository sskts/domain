/**
 * 興行所有者ファクトリー
 *
 * @namespace factory/owner/promoter
 */

import IMultilingualString from '../multilingualString';
import ObjectId from '../objectId';
import * as OwnerFactory from '../owner';
import OwnerGroup from '../ownerGroup';

/**
 *
 * @interface IOwner
 * @extends {OwnerFactory.IOwner}
 * @memberof tobereplaced$
 */
export interface IOwner extends OwnerFactory.IOwner {
    id: string;
    name: IMultilingualString;
}

/**
 * 興行所有者オブジェクトを作成する
 *
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @returns {IOwner}
 * @memberof tobereplaced$
 */
export function create(args: {
    id?: string;
    name?: IMultilingualString;
}): IOwner {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: OwnerGroup.PROMOTER,
        name: (args.name === undefined) ? { ja: '', en: '' } : args.name
    };
}
