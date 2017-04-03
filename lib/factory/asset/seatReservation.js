"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 座席予約資産ファクトリー
 *
 * @namespace SeatReservationAssetFactory
 */
const _ = require("underscore");
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
    if (_.isEmpty(args.performance))
        throw new argumentNull_1.default('performance');
    if (_.isEmpty(args.seat_code))
        throw new argumentNull_1.default('seat_code');
    if (_.isEmpty(args.ticket_code))
        throw new argumentNull_1.default('ticket_code');
    if (_.isEmpty(args.ticket_name_ja))
        throw new argumentNull_1.default('ticket_name_ja');
    if (!_.isNumber(args.std_price))
        throw new argument_1.default('std_price', 'std_price should be number');
    if (!_.isNumber(args.add_price))
        throw new argument_1.default('add_price', 'add_price should be number');
    if (!_.isNumber(args.dis_price))
        throw new argument_1.default('dis_price', 'dis_price should be number');
    if (!_.isNumber(args.sale_price))
        throw new argument_1.default('sale_price', 'sale_price should be number');
    if (!_.isNumber(args.mvtk_app_price))
        throw new argument_1.default('mvtk_app_price', 'mvtk_app_price should be number');
    if (!_.isNumber(args.add_glasses))
        throw new argument_1.default('add_glasses', 'add_glasses should be number');
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
        sale_price: args.sale_price,
        mvtk_app_price: args.mvtk_app_price,
        add_glasses: args.add_glasses
    };
}
exports.create = create;
