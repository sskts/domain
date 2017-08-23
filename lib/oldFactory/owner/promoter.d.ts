/**
 * 興行所有者ファクトリー
 *
 * @namespace factory/owner/promoter
 */
import IMultilingualString from '../multilingualString';
import * as OwnerFactory from '../owner';
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
export declare function create(args: {
    id?: string;
    name?: IMultilingualString;
}): IOwner;
