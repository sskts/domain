/// <reference types="mongoose" />
/**
 * 資産ファクトリー
 *
 * @namespace AssetFactory
 */
import SeatReservationAsset from "../model/asset/seatReservation";
import Authorization from "../model/authorization";
import ObjectId from "../model/objectId";
import Ownership from "../model/ownership";
/**
 * 座席予約資産を作成する
 *
 *
 * @returns {SeatReservationAsset}
 *
 * @memberof AssetFactory
 */
export declare function createSeatReservation(args: {
    _id?: ObjectId;
    ownership: Ownership;
    authorizations: Array<Authorization>;
    performance: string;
    section: string;
    seat_code: string;
    ticket_code: string;
    ticket_name_ja: string;
    ticket_name_en: string;
    ticket_name_kana: string;
    std_price: number;
    add_price: number;
    dis_price: number;
    sale_price: number;
}): SeatReservationAsset;
