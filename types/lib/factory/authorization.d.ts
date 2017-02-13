/// <reference types="mongoose" />
/**
 * 承認ファクトリー
 *
 * @namespace AuthorizationFactory
 */
import SeatReservationAsset from "../model/asset/seatReservation";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import GMOAuthorization from "../model/authorization/gmo";
import ObjectId from "../model/objectId";
export declare function createGMO(args: {
    _id?: ObjectId;
    price: number;
    owner_from: ObjectId;
    owner_to: ObjectId;
    gmo_shop_id: string;
    gmo_shop_pass: string;
    gmo_order_id: string;
    gmo_amount: number;
    gmo_access_id: string;
    gmo_access_pass: string;
    gmo_job_cd: string;
    gmo_pay_type: string;
}): GMOAuthorization;
export declare function createCOASeatReservation(args: {
    _id?: ObjectId;
    coa_tmp_reserve_num: number;
    coa_theater_code: string;
    coa_date_jouei: string;
    coa_title_code: string;
    coa_title_branch_num: string;
    coa_time_begin: string;
    coa_screen_code: string;
    price: number;
    owner_from: ObjectId;
    owner_to: ObjectId;
    assets: SeatReservationAsset[];
}): COASeatReservationAuthorization;
