import IMultilingualString from '../multilingualString';
import * as OwnerFactory from '../owner';
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
 * @interface IOwner
 * @memberof factory/owner/anonymous
 */
export declare type IOwner = OwnerFactory.IOwner & IImmutableFields & IVariableFields;
/**
 * 一般所有者を作成する
 * @memberof factory/owner/anonymous
 */
export declare function create(args: {
    id?: string;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
}): IOwner;
