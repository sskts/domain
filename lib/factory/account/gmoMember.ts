/**
 * GMO会員口座ファクトリー
 *
 * @namespace factory/account/gmoMember
 */

import * as AccountFactory from '../account';

/**
 * GMO会員口座インターフェース
 *
 * @interface IGMOMemberAccount
 * @extends {AccountFactory.IAccount}
 */
export interface IGMOMemberAccount extends AccountFactory.IAccount {
    /**
     * サイトID GMOが発行する値を設定します。
     *
     * @type {string}
     */
    site_id: string;
    /**
     * サイトパスワード GMOが発行する値を設定します。
     *
     * @type {string}
     */
    site_pass: string;
    /**
     * 会員ID GMO登録対象の会員IDを設定します。
     *
     * @type {string}
     */
    member_id: string;
}
