"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * COA座席仮予約ファクトリー
 *
 * @namespace COASeatReservationAuthorizationFactory
 */
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
function create(args) {
    // todo validation
    if (validator.isEmpty(args.coa_tmp_reserve_num.toString()))
        throw new argumentNull_1.default('coa_tmp_reserve_num');
    if (validator.isEmpty(args.coa_theater_code))
        throw new argumentNull_1.default('coa_theater_code');
    if (validator.isEmpty(args.coa_date_jouei))
        throw new argumentNull_1.default('coa_date_jouei');
    if (validator.isEmpty(args.coa_title_code))
        throw new argumentNull_1.default('coa_title_code');
    if (validator.isEmpty(args.coa_title_branch_num))
        throw new argumentNull_1.default('coa_title_branch_num');
    if (validator.isEmpty(args.coa_time_begin))
        throw new argumentNull_1.default('coa_time_begin');
    if (validator.isEmpty(args.coa_screen_code))
        throw new argumentNull_1.default('coa_screen_code');
    if (validator.isEmpty(args.price.toString()))
        throw new argumentNull_1.default('price');
    if (validator.isEmpty(args.owner_from.toString()))
        throw new argumentNull_1.default('owner_from');
    if (validator.isEmpty(args.owner_to.toString()))
        throw new argumentNull_1.default('owner_to');
    if (validator.isEmpty(args.price.toString()))
        throw new argument_1.default('price', 'price should be number');
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
