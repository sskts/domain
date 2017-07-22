/**
 * 供給ファクトリー
 *
 * @namespace/offer
 */
export declare type PaymentMethod = any;
export interface IOffer {
    /**
     * The payment method(s) accepted by seller for this offer.
     */
    acceptedPaymentMethod: PaymentMethod;
}
