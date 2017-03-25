"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 座席予約資産ファクトリー
 *
 * @namespace SeatReservationAssetFactory
 */
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const assetGroup_1 = require("../assetGroup");
const objectId_1 = require("../objectId");
/**
 * 座席予約資産を作成する
 *
 * @returns {SeatReservationAsset}
 */
function create(args) {
    if (validator.isEmpty(args.performance))
        throw new argumentNull_1.default('performance');
    if (validator.isEmpty(args.seat_code))
        throw new argumentNull_1.default('seat_code');
    if (validator.isEmpty(args.ticket_code))
        throw new argumentNull_1.default('ticket_code');
    if (validator.isEmpty(args.std_price.toString()))
        throw new argumentNull_1.default('std_price');
    if (validator.isEmpty(args.add_price.toString()))
        throw new argumentNull_1.default('add_price');
    if (validator.isEmpty(args.dis_price.toString()))
        throw new argumentNull_1.default('dis_price');
    if (validator.isEmpty(args.sale_price.toString()))
        throw new argumentNull_1.default('sale_price');
    if (!validator.isInt(args.std_price.toString()))
        throw new argument_1.default('std_price', 'std_price should be number');
    if (!validator.isInt(args.add_price.toString()))
        throw new argument_1.default('add_price', 'add_price should be number');
    if (!validator.isInt(args.dis_price.toString()))
        throw new argument_1.default('dis_price', 'dis_price should be number');
    if (!validator.isInt(args.sale_price.toString()))
        throw new argument_1.default('sale_price', 'sale_price should be number');
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
exports.create = create;
