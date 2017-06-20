/**
 * 会員所有者ファクトリー
 *
 * @namespace factory/owner/member
 */
import IMultilingualString from '../multilingualString';
import * as OwnerFactory from '../owner';
import * as GMOMemberPaymentMethodFactory from '../paymentMethod/gmoMember';
/**
 * 会員で利用可能な決済方法インターフェース
 * GMO会員以外の決済方法を持つようになれば、ここを拡張する
 */
export declare type IAvailablePaymentMethod = GMOMemberPaymentMethodFactory.IGMOMemberPaymentMethod;
/**
 * 会員所有者インターフェース
 *
 * @interface IMemberOwner
 * @extends {OwnerFactory.IOwner}
 * @memberof factory/owner/member
 */
export interface IMemberOwner extends OwnerFactory.IOwner {
    /**
     * ユーザーネーム
     */
    username: string;
    /**
     * パスワードハッシュ
     */
    password_hash: string;
    /**
     * パスワードハッシュ
     */
    name_first: string;
    /**
     * パスワードハッシュ
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
    /**
     * 決済方法リスト
     *
     * @type {IAvailablePaymentMethod[]}
     * @memberof IMemberOwner
     */
    paymentMethods: IAvailablePaymentMethod[];
}
