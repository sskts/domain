/**
 * 会員所有者ファクトリー
 *
 * @namespace factory/owner/member
 */

import IMultilingualString from '../multilingualString';
import * as OwnerFactory from '../owner';
import * as GMOPaymentAgencyMemberFactory from '../paymentAgencyMember/gmo';

/**
 * 会員で利用可能な決済代行会社会員インターフェース
 * GMO会員以外を持つようになれば、ここを拡張する
 */
export type IAvailablePaymentAgencyMember = GMOPaymentAgencyMemberFactory.IGMOPaymentAgencyMember;

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
    /**
     * 決済代行会社会員リスト
     *
     * @type {IAvailablePaymentAgencyMember[]}
     * @memberof IMemberOwner
     */
    paymentAgencyMembers: IAvailablePaymentAgencyMember[];
}
