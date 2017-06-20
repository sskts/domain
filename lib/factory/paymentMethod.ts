/**
 * 決済方法ファクトリー
 *
 * @namespace factory/paymentMethod
 */

import PaymentAgency from './paymentAgency';
import PaymentMethodGroup from './paymentMethodGroup';

/**
 * 決済方法インターフェース
 *
 * @interface IPaymentMethod
 * @memberof factory/paymentMethod
 */
export interface IPaymentMethod {
    id: string;
    /**
     * 決済代行会社
     */
    payment_agency: PaymentAgency | null;
    payment_method: PaymentMethodGroup;
}
