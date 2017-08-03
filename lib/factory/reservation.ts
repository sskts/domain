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

/**
 * 予約者インターフェース
 */
export interface IUnderName {
    typeOf: string;
    name: string;
}

/**
 * 予約座席インターフェース
 */
export interface ISeat {
    /**
     * 座席クラス
     * The cabin/class of the seat.
     */
    seatingType: string;
    /**
     * 座席番号
     * The location of the reserved seat (e.g., 27B).
     */
    seatNumber: string;
    /**
     * 座席行コード
     * The row location of the reserved seat (e.g., B).
     */
    seatRow: string;
    /**
     * 座席セクション
     * The section location of the reserved seat (e.g. Orchestra).
     */
    seatSection: string;
}

/**
 * COA券種情報
 */
export type ICOATicketInfo = COA.services.reserve.IUpdReserveTicket & {
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * チケット名（カナ）
     */
    ticketNameKana: string;
    /**
     * チケット名（英）
     */
    ticketNameEng: string;
};

/**
 * 予約チケット情報
 */
export interface ITicket {
    /**
     * COA券種情報
     */
    coaTicketInfo: ICOATicketInfo;
    /**
     * チケット発行日
     * The date the ticket was issued.
     */
    dateIssued: Date;
    /**
     * チケット発行者
     * The organization issuing the ticket or permit.
     */
    issuedBy: IUnderName;
    /**
     * 通貨
     * The currency (in 3-letter ISO 4217 format) of the Reservation's price.
     */
    priceCurrency: PriceCurrency;
    /**
     * 座席
     * The seat associated with the ticket.
     */
    ticketedSeat: ISeat;
    /**
     * チケットダウンロードURL
     * Where the ticket can be downloaded.
     */
    ticketDownloadUrl?: URLFactory.IURL;
    /**
     * チケット番号
     * The number or id of the ticket.
     */
    ticketNumber: string;
    /**
     * チケット印刷URL
     * Where the ticket can be printed.
     */
    ticketPrintUrl?: URLFactory.IURL;
    /**
     * チケットトークン
     * QR文字列として使用されます。
     * If the barcode image is hosted on your site, the value of the field is URL of the image, or a barcode or QR URI,
     * such as "barcode128:AB34" (ISO-15417 barcodes), "qrCode:AB34" (QR codes),
     * "aztecCode:AB34" (Aztec codes), "barcodeEAN:1234" (EAN codes) and "barcodeUPCA:1234" (UPCA codes).
     */
    ticketToken: string;
    /**
     * 予約者
     * The person or organization the reservation is for.
     */
    underName: IUnderName;
}

/**
 * 予約インターフェース
 * 座席であれば、ひとつの座席につきひとつの予約
 */
export interface IReservation {
    /**
     * チケット備考
     * Any additional text to appear on a ticket, such as additional privileges or identifiers.
     */
    additionalTicketText: string;
    /**
     * 予約主体
     * Who made the reservation.
     */
    bookingAgent?: any;
    /**
     * 予約日時
     * Date the reservation was made.
     */
    bookingTime?: Date;
    /**
     * 予約キャンセルウェブページURL
     * Web page where reservation can be cancelled.
     */
    cancelReservationUrl?: URLFactory.IURL;
    /**
     * チェックインウェブページURL
     * Webpage where the passenger can check in.
     */
    checkinUrl?: URLFactory.IURL;
    /**
     * 予約確認ウェブページURL
     * Web page where reservation can be confirmed.
     */
    confirmReservationUrl?: URLFactory.IURL;
    /**
     * 予約変更日時
     * Time the reservation was last modified.
     */
    modifiedTime: Date;
    /**
     * 予約変更ウェブページURL
     * Web page where reservation can be modified.
     */
    modifyReservationUrl?: URLFactory.IURL;
    /**
     * 予約座席数
     * Number of seats if unreserved seating.
     */
    numSeats: number;
    /**
     * 合計金額
     * Total price of the Reservation.
     */
    price: number;
    /**
     * 通貨
     * The currency (in 3-letter ISO 4217 format) of the Reservation's price.
     */
    priceCurrency: PriceCurrency;
    /**
     * 予約に使用された会員プログラム
     * Any membership in a frequent flyer, hotel loyalty program, etc. being applied to the reservation.
     */
    programMembershipUsed?: string;
    /**
     * 予約の対象イベント
     * The thing -- restaurant, movie, event, flight, etc. -- the reservation is for.
     */
    reservationFor: EventFactory.IEvent;
    /**
     * 予約番号
     * The number, code or id of the reservation.
     */
    reservationNumber: string;
    /**
     * 予約状態
     * Current status of the reservation.
     */
    reservationStatus: ReservationStatusType;
    /**
     * 予約されたチケット情報
     * A ticket associated with the reservation.
     */
    reservedTicket: ITicket;
    /**
     * The person or organization the reservation is for.
     */
    underName: IUnderName;
}

export function create(args: {
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
    underName: IUnderName;
}) {
    return args;
}
