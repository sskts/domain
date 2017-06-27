import IMultilingualString from '../multilingualString';
import * as AnonymousOwnerFactory from '../owner/anonymous';
/**
 * 会員属性中で不変のフィールド
 *
 * @export
 * @interface IImmutableFields
 * @memberof factory/owner/member
 */
export interface IImmutableFields {
    /**
     * ユーザーネーム
     */
    username: string;
}
/**
 * 会員属性中で可変のフィールド
 *
 * @export
 * @interface IVariableFields
 * @extends {AnonymousOwnerFactory.IAnonymousOwner}
 * @memberof factory/owner/member
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
export declare type IUnhashedFields = IImmutableFields & IVariableFields;
/**
 * 会員所有者インターフェース
 *
 * @export
 * @interface IMemberOwner
 * @memberof factory/owner/member
 */
export declare type IMemberOwner = AnonymousOwnerFactory.IAnonymousOwner & IUnhashedFields & IHashedFields;
export declare function create(args: {
    id?: string;
    username: string;
    password: string;
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    state?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
}): Promise<IMemberOwner>;
export declare function createUnhashedFields(args: {
    username: string;
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
}): IUnhashedFields;
export declare function createVariableFields(args: {
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
}): IVariableFields;
