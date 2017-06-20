/**
 * GMO会員カード口座ファクトリー
 *
 * @namespace factory/account/gmoMemberCard
 */
import * as AccountFactory from '../account';
/**
 * GMO会員口座インターフェース
 * GMO会員に登録されているカード情報を参照するために十分な情報を持つ必要がある
 * 要するに、この情報を使用して口座から引き落としをすることができればよい
 *
 * @interface IGMOMemberCardAccount
 * @extends {AccountFactory.IAccount}
 */
export interface IGMOMemberCardAccount extends AccountFactory.IAccount {
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
    /**
     * カード登録連番モード 1:物理モード
     *
     * @type {string}
     */
    seq_mode: string;
    /**
     * カード登録連番 参照するカードの登録連番を設定します。
     *
     * @type {string}
     */
    card_seq: string;
}
