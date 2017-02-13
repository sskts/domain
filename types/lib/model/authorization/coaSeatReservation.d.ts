/// <reference types="mongoose" />
import SeatReservationAsset from '../asset/seatReservation';
import Authorization from '../authorization';
import ObjectId from '../objectId';
/**
 * COA座席仮予約
 *
 *
 * @class COASeatReservationAuthorization
 * @extends {Authorization}
 */
export default class COASeatReservationAuthorization extends Authorization {
    readonly _id: ObjectId;
    readonly coa_tmp_reserve_num: number;
    readonly coa_theater_code: string;
    readonly coa_date_jouei: string;
    readonly coa_title_code: string;
    readonly coa_title_branch_num: string;
    readonly coa_time_begin: string;
    readonly coa_screen_code: string;
    readonly price: number;
    readonly owner_from: ObjectId;
    readonly owner_to: ObjectId;
    readonly assets: SeatReservationAsset[];
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
    constructor(_id: ObjectId, coa_tmp_reserve_num: number, coa_theater_code: string, coa_date_jouei: string, coa_title_code: string, coa_title_branch_num: string, coa_time_begin: string, coa_screen_code: string, price: number, owner_from: ObjectId, owner_to: ObjectId, assets: SeatReservationAsset[]);
}
