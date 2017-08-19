/**
 * 人物ファクトリー
 *
 * @namespace factory/person
 */

import * as _ from 'underscore';
import * as validator from 'validator';

import ArgumentError from '../error/argument';

import * as ProgramMembershipFactory from './programMembership';

/**
 * 不変属性インターフェース
 */
export interface IImmutableFields {
    /**
     * 人物ID
     */
    id: string;
    /**
     * スキーマタイプ
     */
    typeOf: string;
}

/**
 * プロフィールインターフェース
 */
export interface IProfile {
    /**
     * 名
     */
    givenName: string;
    /**
     * 姓
     */
    familyName: string;
    /**
     * メールアドレス
     */
    email: string;
    /**
     * 電話番号
     */
    telephone: string;
}

/**
 * 会員情報インターフェース
 */
export interface IMember {
    username?: string;
    /**
     * 会員プログラム
     */
    memberOf?: ProgramMembershipFactory.IProgramMembership;
}

export interface IHashedFields {
    /**
     * パスワードハッシュ
     */
    hashedPassword?: string;
}

export type IPublicFields = IImmutableFields & IMember & IProfile;

/**
 * 人物インターフェース
 *
 * @export
 * @interface IPerson
 * @memberof factory/person
 */
export type IPerson = IPublicFields & IHashedFields & {
    // owns: OwnershipInfoFactory.IOwnership[];
};

/**
 * 人物を作成する
 *
 * @memberof factory/person
 */
export function create(args: {
    id?: string;
    username?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
    telephone?: string;
    memberOf?: ProgramMembershipFactory.IProgramMembership;
    // owns: OwnershipInfoFactory.IOwnership[];
}): IPerson {
    if (!_.isEmpty(args.email) && !validator.isEmail(<string>args.email)) {
        throw new ArgumentError('email', 'invalid email');
    }

    return {
        id: (args.id === undefined) ? '' : args.id,
        typeOf: 'Person',
        givenName: (args.givenName === undefined) ? '' : args.givenName,
        familyName: (args.familyName === undefined) ? '' : args.familyName,
        email: (args.email === undefined) ? '' : args.email,
        telephone: (args.telephone === undefined) ? '' : args.telephone,
        username: args.username,
        memberOf: args.memberOf
    };
}
