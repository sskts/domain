import * as Asset from './asset';
import AuthorizationGroup from './authorizationGroup';
/**
 * 承認インターフェース
 *
 * @export
 * @interface IAuthorization
 * @param {string} id
 * @param {Asset} asset 資産
 * @param {number} price 資産価格
 * @param {string} owner_from 誰が
 * @param {string} owner_to 誰に対して
 */
export interface IAuthorization {
    id: string;
    group: AuthorizationGroup;
    price: number;
    owner_from: string;
    owner_to: string;
}
export interface IAssetAuthorization extends IAuthorization {
}
/**
 * COA座席仮予約
 *
 * @param {number} coa_tmp_reserve_num
 * @param {string} coa_theater_code
 * @param {string} coa_date_jouei
 * @param {string} coa_title_code
 * @param {string} coa_title_branch_num
 * @param {string} coa_time_begin
 * @param {string} coa_screen_code
 * @param {Asset.SeatReservation[]} assets 資産リスト(COA側では複数座席に対してひとつの仮予約番号が割り当てられるため)
 */
export interface ICOASeatReservationAuthorization extends IAuthorization {
    coa_tmp_reserve_num: number;
    coa_theater_code: string;
    coa_date_jouei: string;
    coa_title_code: string;
    coa_title_branch_num: string;
    coa_time_begin: string;
    coa_screen_code: string;
    assets: Asset.ISeatReservationAsset[];
}
/**
 * GMOオーソリ
 *
 * @param {string} gmo_shop_id
 * @param {string} gmo_shop_pass
 * @param {string} gmo_order_id
 * @param {number} gmo_amount
 * @param {string} gmo_access_id
 * @param {string} gmo_access_pass
 * @param {string} gmo_job_cd
 * @param {string} gmo_pay_type
 */
export interface IGMOAuthorization extends IAuthorization {
    gmo_shop_id: string;
    gmo_shop_pass: string;
    gmo_order_id: string;
    gmo_amount: number;
    gmo_access_id: string;
    gmo_access_pass: string;
    gmo_job_cd: string;
    gmo_pay_type: string;
}
export declare function createGMO(args: {
    id?: string;
    price: number;
    owner_from: string;
    owner_to: string;
    gmo_shop_id: string;
    gmo_shop_pass: string;
    gmo_order_id: string;
    gmo_amount: number;
    gmo_access_id: string;
    gmo_access_pass: string;
    gmo_job_cd: string;
    gmo_pay_type: string;
}): IGMOAuthorization;
export declare function createCOASeatReservation(args: {
    id?: string;
    price: number;
    owner_from: string;
    owner_to: string;
    coa_tmp_reserve_num: number;
    coa_theater_code: string;
    coa_date_jouei: string;
    coa_title_code: string;
    coa_title_branch_num: string;
    coa_time_begin: string;
    coa_screen_code: string;
    assets: Asset.ISeatReservationAsset[];
}): ICOASeatReservationAuthorization;
