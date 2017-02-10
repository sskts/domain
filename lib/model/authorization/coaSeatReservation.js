"use strict";
const validator = require("validator");
const authorization_1 = require("../authorization");
const authorizationGroup_1 = require("../authorizationGroup");
/**
 * COA座席仮予約
 *
 *
 * @class COASeatReservationAuthorization
 * @extends {Authorization}
 */
class COASeatReservationAuthorization extends authorization_1.default {
    /**
     * Creates an instance of COASeatReservationAuthorization.
     *
     * @param {ObjectId} _id
     * @param {number} coa_tmp_reserve_num
     * @param {string} coa_theater_code
     * @param {string} coa_date_jouei
     * @param {string} coa_title_code
     * @param {string} coa_title_branch_num
     * @param {string} coa_time_begin
     * @param {string} coa_screen_code
     * @param {number} price
     * @param {ObjectId} owner_from
     * @param {ObjectId} owner_to
     * @param {Array<SeatReservationAsset>} assets 資産リスト(COA側では複数座席に対してひとつの仮予約番号が割り当てられるため)
     *
     * @memberOf COASeatReservationAuthorization
     */
    constructor(_id, coa_tmp_reserve_num, coa_theater_code, coa_date_jouei, coa_title_code, coa_title_branch_num, coa_time_begin, coa_screen_code, price, owner_from, owner_to, assets) {
        super(_id, authorizationGroup_1.default.COA_SEAT_RESERVATION, price, owner_from, owner_to);
        this._id = _id;
        this.coa_tmp_reserve_num = coa_tmp_reserve_num;
        this.coa_theater_code = coa_theater_code;
        this.coa_date_jouei = coa_date_jouei;
        this.coa_title_code = coa_title_code;
        this.coa_title_branch_num = coa_title_branch_num;
        this.coa_time_begin = coa_time_begin;
        this.coa_screen_code = coa_screen_code;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
        this.assets = assets;
        // TODO validation
        if (validator.isEmpty(coa_tmp_reserve_num.toString()))
            throw new Error("coa_tmp_reserve_num required.");
        if (validator.isEmpty(coa_theater_code))
            throw new Error("coa_theater_code required.");
        if (validator.isEmpty(coa_date_jouei))
            throw new Error("coa_date_jouei required.");
        if (validator.isEmpty(coa_title_code))
            throw new Error("coa_title_code required.");
        if (validator.isEmpty(coa_title_branch_num))
            throw new Error("coa_title_branch_num required.");
        if (validator.isEmpty(coa_time_begin))
            throw new Error("coa_time_begin required.");
        if (validator.isEmpty(coa_screen_code))
            throw new Error("coa_screen_code required.");
        if (validator.isEmpty(price.toString()))
            throw new Error("price required.");
        if (validator.isEmpty(owner_from.toString()))
            throw new Error("owner_from required.");
        if (validator.isEmpty(owner_to.toString()))
            throw new Error("owner_to required.");
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = COASeatReservationAuthorization;
