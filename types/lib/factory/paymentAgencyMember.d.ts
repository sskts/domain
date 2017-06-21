/**
 * 決済代行会社会員ファクトリー
 *
 * @namespace factory/paymentAgencyMember
 */
import PaymentAgencyMemberGroup from './paymentAgencyMemberGroup';
/**
 * 決済代行会社会員インターフェース
 *
 * @interface IPaymentAgencyMember
 * @memberof factory/paymentAgencyMember
 */
export interface IPaymentAgencyMember {
    /**
     * 決済代行会社会員グループ
     */
    group: PaymentAgencyMemberGroup;
}
