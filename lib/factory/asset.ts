/**
 * 資産ファクトリー
 *
 * @namespace AssetFactory
 */

import SeatReservationAsset from '../model/asset/seatReservation';
import Authorization from '../model/authorization';
import ObjectId from '../model/objectId';
import Ownership from '../model/ownership';

/**
 * 座席予約資産を作成する
 *
 *
 * @returns {SeatReservationAsset}
 *
 * @memberof AssetFactory
 */
export function createSeatReservation(args: {
    _id?: ObjectId,
    ownership: Ownership,
    authorizations: Authorization[],
    performance: string,
    section: string,
    seat_code: string,
    ticket_code: string,
    ticket_name_ja: string,
    ticket_name_en: string,
    ticket_name_kana: string,
    std_price: number,
    add_price: number,
    dis_price: number,
    sale_price: number
}) {
    return new SeatReservationAsset(
        (args._id) ? args._id : ObjectId(),
        args.ownership,
        args.authorizations,
        args.performance,
        args.section,
        args.seat_code,
        args.ticket_code,
        args.ticket_name_ja,
        args.ticket_name_en,
        args.ticket_name_kana,
        args.std_price,
        args.add_price,
        args.dis_price,
        args.sale_price
    );
}
