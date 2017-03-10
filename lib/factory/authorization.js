"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 承認ファクトリー
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @namespace AuthorizationFacroty
 */
const validator = require("validator");
const authorizationGroup_1 = require("./authorizationGroup");
const objectId_1 = require("./objectId");
function createGMO(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: authorizationGroup_1.default.GMO,
        price: args.price,
        owner_from: args.owner_from,
        owner_to: args.owner_to,
        gmo_shop_id: args.gmo_shop_id,
        gmo_shop_pass: args.gmo_shop_pass,
        gmo_order_id: args.gmo_order_id,
        gmo_amount: args.gmo_amount,
        gmo_access_id: args.gmo_access_id,
        gmo_access_pass: args.gmo_access_pass,
        gmo_job_cd: args.gmo_job_cd,
        gmo_pay_type: args.gmo_pay_type
    };
}
exports.createGMO = createGMO;
function createCOASeatReservation(args) {
    // todo validation
    if (validator.isEmpty(args.coa_tmp_reserve_num.toString()))
        throw new Error('coa_tmp_reserve_num required.');
    if (validator.isEmpty(args.coa_theater_code))
        throw new Error('coa_theater_code required.');
    if (validator.isEmpty(args.coa_date_jouei))
        throw new Error('coa_date_jouei required.');
    if (validator.isEmpty(args.coa_title_code))
        throw new Error('coa_title_code required.');
    if (validator.isEmpty(args.coa_title_branch_num))
        throw new Error('coa_title_branch_num required.');
    if (validator.isEmpty(args.coa_time_begin))
        throw new Error('coa_time_begin required.');
    if (validator.isEmpty(args.coa_screen_code))
        throw new Error('coa_screen_code required.');
    if (validator.isEmpty(args.price.toString()))
        throw new Error('price required.');
    if (validator.isEmpty(args.owner_from.toString()))
        throw new Error('owner_from required.');
    if (validator.isEmpty(args.owner_to.toString()))
        throw new Error('owner_to required.');
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
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
exports.createCOASeatReservation = createCOASeatReservation;