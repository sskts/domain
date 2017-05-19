"use strict";
/**
 * COA座席仮予約ファクトリー
 * todo jsdoc
 *
 * @namespace factory/authorization/coaSeatReservation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
/**
 *
 * @memberof factory/authorization/coaSeatReservation
 */
function create(args) {
    if (_.isEmpty(args.owner_from))
        throw new argumentNull_1.default('owner_from');
    if (_.isEmpty(args.owner_to))
        throw new argumentNull_1.default('owner_to');
    if (_.isEmpty(args.coa_theater_code))
        throw new argumentNull_1.default('coa_theater_code');
    if (_.isEmpty(args.coa_date_jouei))
        throw new argumentNull_1.default('coa_date_jouei');
    if (_.isEmpty(args.coa_title_code))
        throw new argumentNull_1.default('coa_title_code');
    if (_.isEmpty(args.coa_title_branch_num))
        throw new argumentNull_1.default('coa_title_branch_num');
    if (_.isEmpty(args.coa_time_begin))
        throw new argumentNull_1.default('coa_time_begin');
    if (_.isEmpty(args.coa_screen_code))
        throw new argumentNull_1.default('coa_screen_code');
    if (!_.isNumber(args.coa_tmp_reserve_num))
        throw new argument_1.default('coa_tmp_reserve_num', 'coa_tmp_reserve_num should be number');
    if (!_.isNumber(args.price))
        throw new argument_1.default('price', 'price should be number');
    if (args.price <= 0)
        throw new argument_1.default('price', 'price should be greater than 0');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: authorizationGroup_1.default.COA_SEAT_RESERVATION,
        coa_tmp_reserve_num: args.coa_tmp_reserve_num,
        coa_theater_code: args.coa_theater_code,
        coa_date_jouei: args.coa_date_jouei,
        coa_title_code: args.coa_title_code,
        coa_title_branch_num: args.coa_title_branch_num,
        coa_time_begin: args.coa_time_begin,
        coa_screen_code: args.coa_screen_code,
        price: args.price,
        owner_from: args.owner_from,
        owner_to: args.owner_to,
        assets: args.assets
    };
}
exports.create = create;
