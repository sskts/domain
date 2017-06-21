/**
 * GMO決済代行会社会員ファクトリー
 *
 * @namespace factory/paymentAgencyMember/gmo
 */
import * as PaymentAgencyMemberFactory from '../paymentAgencyMember';
/**
 * GMO決済代行会社会員インターフェース
 * GMO会員情報を参照するために十分な情報を持つ必要がある
 * 要するに、この情報を使用してクレジットカードを使用できればよい
 *
 * todo gmo-service側での定義と対応するはずなのでgmo-service側の改修が済んだら調整
 *
 * @interface IGMOPaymentAgencyMember
 * @extends {PaymentAgencyMemberFactory.IPaymentAgencyMember}
 */
export interface IGMOPaymentAgencyMember extends PaymentAgencyMemberFactory.IPaymentAgencyMember {
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
