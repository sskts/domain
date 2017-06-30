/**
 * 一般所有者ファクトリー
 *
 * @namespace factory/owner/anonymous
 */

import * as _ from 'underscore';
import * as validator from 'validator';

import ArgumentError from '../../error/argument';

import IMultilingualString from '../multilingualString';
import ObjectId from '../objectId';
import * as OwnerFactory from '../owner';
import OwnerGroup from '../ownerGroup';

/**
 * 属性中で不変のフィールド
 *
 * @export
 * @interface IImmutableFields
 * @memberof factory/owner/anonymous
 */
export interface IImmutableFields {
    /**
     * ユーザーネーム
     * 匿名所有者の場合システムで自動発行
     */
    username: string;
}

/**
 * 属性中で可変のフィールド
 *
 * @export
 * @interface IVariableFields
 * @memberof factory/owner/anonymous
 */
export interface IVariableFields {
    /**
     * 名
     */
    name_first: string;
    /**
     * 姓
     */
    name_last: string;
    /**
     * メールアドレス
     */
    email: string;
    /**
     * 電話番号
     */
    tel: string;
    /**
     * 説明
     */
    description: IMultilingualString;
    /**
     * 備考
     */
    notes: IMultilingualString;
}

/**
 * 匿名所有者インターフェース
 *
 * @export
 * @interface IAnonymousOwner
 * @memberof factory/owner/anonymous
 */
export type IAnonymousOwner = OwnerFactory.IOwner & IImmutableFields & IVariableFields;

/**
 * 一般所有者を作成する
 * @memberof factory/owner/anonymous
 */
export function create(args: {
    id?: string;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
}): IAnonymousOwner {
    if (!_.isEmpty(args.email) && !validator.isEmail(<string>args.email)) throw new ArgumentError('email', 'invalid email');

    const id = (args.id === undefined) ? ObjectId().toString() : args.id;

    return {
        id: id,
        group: OwnerGroup.ANONYMOUS,
        username: `sskts-domain:owners:anonymous:${id}`,
        name_first: (args.name_first === undefined) ? '' : args.name_first,
        name_last: (args.name_last === undefined) ? '' : args.name_last,
        email: (args.email === undefined) ? '' : args.email,
        tel: (args.tel === undefined) ? '' : args.tel,
        description: { en: '', ja: '' },
        notes: { en: '', ja: '' }
    };
}
