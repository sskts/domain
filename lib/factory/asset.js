/**
 * 資産ファクトリー
 *
 * @namespace AssetFactory
 */
"use strict";
const seatReservation_1 = require("../model/asset/seatReservation");
const objectId_1 = require("../model/objectId");
/**
 * 座席予約資産を作成する
 *
 *
 * @returns {SeatReservationAsset}
 *
 * @memberof AssetFactory
 */
function createSeatReservation(args) {
    return new seatReservation_1.default((args._id) ? args._id : objectId_1.default(), args.ownership, args.authorizations, args.performance, args.section, args.seat_code, args.ticket_code, args.ticket_name_ja, args.ticket_name_en, args.ticket_name_kana, args.std_price, args.add_price, args.dis_price, args.sale_price);
}
exports.createSeatReservation = createSeatReservation;
