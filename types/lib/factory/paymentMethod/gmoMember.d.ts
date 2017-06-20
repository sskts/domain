/**
 * GMO会員決済方法ファクトリー
 *
 * @namespace factory/account/gmoMember
 */
import * as PaymentMethodFactory from '../paymentMethod';
/**
 * GMO会員決済方法インターフェース
 * GMO会員情報を参照するために十分な情報を持つ必要がある
 * 要するに、この情報を使用してクレジットカードを使用できればよい
 *
 * @interface IGMOMemberPaymentMethod
 * @extends {PaymentMethodFactory.IPaymentMethod}
 */
export interface IGMOMemberPaymentMethod extends PaymentMethodFactory.IPaymentMethod {
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
