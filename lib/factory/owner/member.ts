/**
 * 会員所有者ファクトリー
 *
 * @namespace factory/owner/member
 */

import * as GMOMemberAccount from '../account/gmoMember';
import IMultilingualString from '../multilingualString';
import * as OwnerFactory from '../owner';

/**
 * 会員で利用可能な口座インターフェース
 * GMO会員以外の口座を持つようになれば、ここを拡張する
 */
export type IAvailableAccount = GMOMemberAccount.IGMOMemberAccount;

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
     * 口座リスト
     *
     * @type {IAvailableAccount[]}
     * @memberof IMemberOwner
     */
    accounts: IAvailableAccount[];
}
