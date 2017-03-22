"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 資産ファクトリー
 *
 * @namespace AssetFactory
 */
const assetGroup_1 = require("./assetGroup");
const objectId_1 = require("./objectId");
/**
 * 座席予約資産を作成する
 *
 * @returns {SeatReservationAsset}
 */
function createSeatReservation(args) {
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        ownership: args.ownership,
        group: assetGroup_1.default.SEAT_RESERVATION,
        price: args.sale_price,
        authorizations: (args.authorizations === undefined) ? [] : args.authorizations,
        performance: args.performance,
        section: args.section,
        seat_code: args.seat_code,
        ticket_code: args.ticket_code,
        ticket_name_ja: args.ticket_name_ja,
        ticket_name_en: args.ticket_name_en,
        ticket_name_kana: args.ticket_name_kana,
        std_price: args.std_price,
        add_price: args.add_price,
        dis_price: args.dis_price,
        sale_price: args.sale_price
    };
}
exports.createSeatReservation = createSeatReservation;
