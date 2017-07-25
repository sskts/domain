"use strict";
/**
 * 注文ファクトリー
 * An order is a confirmation of a transaction (a receipt),
 * which can contain multiple line items, each represented by an Offer that has been accepted by the customer.
 *
 * @namespace factory/order
 */
Object.defineProperty(exports, "__esModule", { value: true });
const orderStatus_1 = require("./orderStatus");
const paymentMethod_1 = require("./paymentMethod");
const priceCurrency_1 = require("./priceCurrency");
const reservationStatusType_1 = require("./reservationStatusType");
function createFromBuyTransaction(args) {
    return {
        seller: args.seller,
        orderNumber: args.orderNumber,
        priceCurrency: priceCurrency_1.default.JPY,
        price: args.seatReservationAuthorization.price,
        acceptedOffer: args.seatReservationAuthorization.object.acceptedOffer.map((offer) => {
            const reservation = offer.itemOffered;
            reservation.reservationStatus = reservationStatusType_1.default.ReservationConfirmed;
            reservation.underName.name = args.customerName;
            reservation.reservedTicket.underName.name = args.customerName;
            return offer.itemOffered;
        }),
        url: '',
        orderStatus: orderStatus_1.default.OrderDelivered,
        paymentMethod: paymentMethod_1.default.CreditCard,
        paymentMethodId: '',
        orderDate: new Date(),
        isGift: false,
        discount: 0,
        discountCurrency: '',
        customer: {
            name: args.customerName
        },
        orderInquiryKey: args.orderInquiryKey
    };
}
exports.createFromBuyTransaction = createFromBuyTransaction;
