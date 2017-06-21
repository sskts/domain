import IMultilingualString from '../multilingualString';
import * as OwnerFactory from '../owner';
import * as GMOPaymentAgencyMemberFactory from '../paymentAgencyMember/gmo';
/**
 * 会員で利用可能な決済代行会社会員インターフェース
 * GMO会員以外を持つようになれば、ここを拡張する
 */
export declare type IAvailablePaymentAgencyMember = GMOPaymentAgencyMemberFactory.IGMOPaymentAgencyMember;
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
    payment_agency_members: IAvailablePaymentAgencyMember[];
}
export declare function create(args: {
    id?: string;
    username: string;
    password_hash: string;
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
    payment_agency_members: IAvailablePaymentAgencyMember[];
}): IMemberOwner;
