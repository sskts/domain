import * as OwnershipInfoFactory from './ownershipInfo';
import * as ProgramMembershipFactory from './programMembership';
export interface IImmutableFields {
    id: string;
    typeOf: string;
}
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
export declare type IPublicFields = IImmutableFields & IMember & IProfile;
/**
 * 人物インターフェース
 *
 * @export
 * @interface IPerson
 * @memberof factory/person
 */
export declare type IPerson = IPublicFields & IHashedFields & {
    owns: OwnershipInfoFactory.IOwnership[];
};
/**
 * 人物を作成する
 *
 * @memberof factory/person
 */
export declare function create(args: {
    id?: string;
    username?: string;
    password?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
    telephone?: string;
    memberOf?: ProgramMembershipFactory.IProgramMembership;
    owns: OwnershipInfoFactory.IOwnership[];
}): Promise<IPerson>;
