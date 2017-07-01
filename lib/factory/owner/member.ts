/**
 * 会員所有者ファクトリー
 *
 * @namespace factory/owner/member
 */

import * as bcrypt from 'bcryptjs';
import * as _ from 'underscore';
import * as validator from 'validator';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import IMultilingualString from '../multilingualString';
import ObjectId from '../objectId';
import * as AnonymousOwnerFactory from '../owner/anonymous';
import OwnerGroup from '../ownerGroup';

/**
 * 会員属性中で不変のフィールド
 *
 * @export
 * @interface IImmutableFields
 * @memberof factory/owner/member
 */
export type IImmutableFields = AnonymousOwnerFactory.IImmutableFields;

/**
 * 会員属性中で可変のフィールド
 *
 * @export
 * @interface IVariableFields
 * @extends {AnonymousOwnerFactory.IAnonymousOwner}
 * @memberof factory/owner/member
 */
export type IVariableFields = AnonymousOwnerFactory.IVariableFields;

/**
 * 会員属性中でハッシュ化されたフィールド
 *
 * @export
 * @interface IHashedFields
 * @memberof factory/owner/member
 */
export interface IHashedFields {
    /**
     * パスワードハッシュ
     */
    password_hash: string;
}

/**
 * 会員属性中でハッシュ化されていないフィールド
 *
 * @export
 * @interface IUnhashedFields
 * @memberof factory/owner/member
 */
export type IUnhashedFields = IImmutableFields & IVariableFields;

/**
 * 会員所有者インターフェース
 *
 * @export
 * @interface IOwner
 * @memberof factory/owner/member
 */
export type IOwner = AnonymousOwnerFactory.IOwner & IUnhashedFields & IHashedFields;

export async function create(args: {
    id?: string;
    username: string;
    password: string;
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
}): Promise<IOwner> {
    if (_.isEmpty(args.password)) throw new ArgumentNullError('password');

    const unhashedFields = createUnhashedFields(args);

    // パスワードハッシュ化
    // todo ハッシュ化文字列をインターフェースとして用意し、ハッシュプロセスをどこかへ移動する
    const SALT_LENGTH = 8;
    const passwordHash = await bcrypt.hash(args.password, SALT_LENGTH);

    return {
        ...unhashedFields,
        ...{
            id: (args.id === undefined) ? ObjectId().toString() : args.id,
            group: OwnerGroup.MEMBER,
            password_hash: passwordHash
        }
    };
}

export function createUnhashedFields(args: {
    username: string;
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
}): IUnhashedFields {
    if (_.isEmpty(args.username)) throw new ArgumentNullError('username');

    const variableFields = createVariableFields(args);

    return {
        ...variableFields,
        ...{
            username: args.username
        }
    };
}

export function createVariableFields(args: {
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
}): IVariableFields {
    if (_.isEmpty(args.name_first)) throw new ArgumentNullError('name_first');
    if (_.isEmpty(args.name_last)) throw new ArgumentNullError('name_last');
    if (_.isEmpty(args.email)) throw new ArgumentNullError('email');

    if (!validator.isEmail(args.email)) {
        throw new ArgumentError('email', 'invalid email');
    }

    return {
        name_first: args.name_first,
        name_last: args.name_last,
        email: args.email,
        tel: (args.tel === undefined) ? '' : args.tel,
        description: (args.description === undefined) ? { en: '', ja: '' } : args.description,
        notes: (args.notes === undefined) ? { en: '', ja: '' } : args.notes
    };
}
