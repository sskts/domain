/**
 * 注文ファクトリー
 * An order is a confirmation of a transaction (a receipt),
 * which can contain multiple line items, each represented by an Offer that has been accepted by the customer.
 *
 * @namespace factory/order
 */
import * as OrderInquiryKeyFactory from './orderInquiryKey';
import OrderStatus from './orderStatus';
import PaymentMethod from './paymentMethod';
import PriceCurrency from './priceCurrency';
import * as ReservationFactory from './reservation';
import * as SeatReservationAuthorizationFactory from './authorization/seatReservation';
export declare type IOffer = ReservationFactory.IReservation;
export interface ISeller {
    /**
     * Text	(required) Name of the Organization.
     */
    name: string;
    /**
     * URL	The Freebase URL for the merchant.
     */
    sameAs: string;
}
export interface ICustomer {
    /**
     * Name of the Person.
     */
    name: string;
}
export interface IOrder {
    /**
     * Organization or Person	(required)
     * The party taking the order (e.g. Amazon.com is a merchant for many sellers). Also accepts a string (e.g. "Amazon.com").
     */
    seller: ISeller;
    /**
     * Text	(required)
     * The merchant- specific identifier for the transaction.
     */
    orderNumber: string;
    /**
     * Text	(required)
     * The currency (in 3 - letter ISO 4217 format) of the order price.
     */
    priceCurrency: PriceCurrency;
    /**
     * Number or Text	(required)
     * The total price of the entire transaction.
     */
    price: number;
    /**
     * Offer	(required)
     * The offers included in the order.Also accepts an array of objects.
     */
    acceptedOffers: IOffer[];
    /**
     * URL	(recommended for confirmation cards/ Search Answers)
     * URL of the Order, typically a link to the merchant's website where the user can retrieve further details about an order.
     */
    url: string;
    /**
     * OrderStatus	(recommended for confirmation cards/ Search Answers)
     * The current status of the order.
     */
    orderStatus: OrderStatus;
    /**
     * The name of the credit card or other method of payment for the order.
     */
    paymentMethod: PaymentMethod;
    /**
     * An identifier for the method of payment used (e.g.the last 4 digits of the credit card).
     */
    paymentMethodId: string;
    /**
     * Date order was placed.
     */
    orderDate: Date;
    /**
     * Was the offer accepted as a gift for someone other than the buyer.
     */
    isGift: boolean;
    /**
     * Any discount applied.
     */
    discount: number;
    /**
     * The currency (in 3 - letter ISO 4217 format) of the discount.
     */
    discountCurrency: string;
    /**
     * Person or Organization
     * Party placing the order.
     */
    customer: ICustomer;
    orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey;
}
export declare function createFromBuyTransaction(args: {
    seatReservationAuthorization: SeatReservationAuthorizationFactory.IAuthorization;
    customerName: string;
    seller: ISeller;
    orderNumber: string;
    orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey;
}): IOrder;
