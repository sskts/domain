/**
 * 予約ファクトリー
 *
 * @namespace factory/reservation
 */
import * as COA from '@motionpicture/coa-service';
import * as EventFactory from './event';
import PriceCurrency from './priceCurrency';
import ReservationStatusType from './reservationStatusType';
import * as URLFactory from './url';
export interface IUnderName {
    typeOf: string;
    name: string;
}
export interface ISeat {
    /**
     * The cabin/class of the seat.
     */
    seatingType: string;
    /**
     * The location of the reserved seat (e.g., 27B).
     */
    seatNumber: string;
    /**
     * The row location of the reserved seat (e.g., B).
     */
    seatRow: string;
    /**
     * The section location of the reserved seat (e.g. Orchestra).
     */
    seatSection: string;
}
export interface ITicket {
    coaTicketInfo: COA.services.reserve.IUpdReserveTicket;
    /**
     * The date the ticket was issued.
     */
    dateIssued: Date;
    /**
     * The organization issuing the ticket or permit.
     */
    issuedBy: IUnderName;
    /**
     * The currency (in 3-letter ISO 4217 format) of the Reservation's price.
     */
    priceCurrency: PriceCurrency;
    /**
     * The seat associated with the ticket.
     */
    ticketedSeat: ISeat;
    /**
     * Where the ticket can be downloaded.
     */
    ticketDownloadUrl?: URLFactory.IURL;
    /**
     * The number or id of the ticket.
     */
    ticketNumber: string;
    /**
     * Where the ticket can be printed.
     */
    ticketPrintUrl?: URLFactory.IURL;
    /**
     * If the barcode image is hosted on your site, the value of the field is URL of the image, or a barcode or QR URI,
     * such as "barcode128:AB34" (ISO-15417 barcodes), "qrCode:AB34" (QR codes),
     * "aztecCode:AB34" (Aztec codes), "barcodeEAN:1234" (EAN codes) and "barcodeUPCA:1234" (UPCA codes).
     */
    ticketToken: string;
    /**
     * The total price for the reservation or ticket, including applicable taxes, shipping, etc.
     */
    totalPrice: number;
    /**
     * The person or organization the reservation is for.
     */
    underName: IUnderName;
}
export interface IReservation {
    /**
     * Any additional text to appear on a ticket, such as additional privileges or identifiers.
     */
    additionalTicketText: string;
    /**
     * Who made the reservation.
     */
    bookingAgent?: any;
    /**
     * Date the reservation was made.
     */
    bookingTime?: Date;
    /**
     * Web page where reservation can be cancelled.
     */
    cancelReservationUrl?: URLFactory.IURL;
    /**
     * Webpage where the passenger can check in.
     */
    checkinUrl?: URLFactory.IURL;
    /**
     * Web page where reservation can be confirmed.
     */
    confirmReservationUrl?: URLFactory.IURL;
    /**
     * Time the reservation was last modified.
     */
    modifiedTime: Date;
    /**
     * Web page where reservation can be modified.
     */
    modifyReservationUrl?: URLFactory.IURL;
    /**
     * Number of seats if unreserved seating.
     */
    numSeats: number;
    /**
     * Total price of the Reservation.
     */
    price: number;
    /**
     * The currency (in 3-letter ISO 4217 format) of the Reservation's price.
     */
    priceCurrency: PriceCurrency;
    /**
     * Any membership in a frequent flyer, hotel loyalty program, etc. being applied to the reservation.
     */
    programMembershipUsed?: string;
    /**
     * The thing -- restaurant, movie, event, flight, etc. -- the reservation is for.
     */
    reservationFor: EventFactory.IEvent;
    /**
     * The number, code or id of the reservation.
     */
    reservationNumber: string;
    /**
     * Current status of the reservation.
     */
    reservationStatus: ReservationStatusType;
    /**
     * A ticket associated with the reservation.
     */
    reservedTicket: ITicket;
    /**
     * The total price for the reservation or ticket, including applicable taxes, shipping, etc.
     */
    totalPrice: number;
    /**
     * The person or organization the reservation is for.
     */
    underName: IUnderName;
}
export declare function create(args: {
    additionalTicketText: string;
    bookingAgent?: string;
    bookingTime?: Date;
    cancelReservationUrl?: URLFactory.IURL;
    checkinUrl?: URLFactory.IURL;
    confirmReservationUrl?: URLFactory.IURL;
    modifiedTime: Date;
    modifyReservationUrl?: URLFactory.IURL;
    numSeats: number;
    price: number;
    priceCurrency: PriceCurrency;
    programMembershipUsed?: string;
    reservationFor: EventFactory.IEvent;
    reservationNumber: string;
    reservationStatus: ReservationStatusType;
    reservedTicket: ITicket;
    totalPrice: number;
    underName: IUnderName;
}): {
    additionalTicketText: string;
    bookingAgent?: string | undefined;
    bookingTime?: Date | undefined;
    cancelReservationUrl?: string | undefined;
    checkinUrl?: string | undefined;
    confirmReservationUrl?: string | undefined;
    modifiedTime: Date;
    modifyReservationUrl?: string | undefined;
    numSeats: number;
    price: number;
    priceCurrency: PriceCurrency;
    programMembershipUsed?: string | undefined;
    reservationFor: EventFactory.IEvent;
    reservationNumber: string;
    reservationStatus: ReservationStatusType;
    reservedTicket: ITicket;
    totalPrice: number;
    underName: IUnderName;
};
