import * as SeatReservationAssetFactory from '../asset/seatReservation';
import * as AuthorizationFactory from '../authorization';
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
 * @param {Asset.ISeatReservationAsset[]} assets 資産リスト(COA側では複数座席に対してひとつの仮予約番号が割り当てられるため)
 * @memberof tobereplaced$
 */
export interface ICOASeatReservationAuthorization extends AuthorizationFactory.IAuthorization {
    coa_tmp_reserve_num: number;
    coa_theater_code: string;
    coa_date_jouei: string;
    coa_title_code: string;
    coa_title_branch_num: string;
    coa_time_begin: string;
    coa_screen_code: string;
    assets: SeatReservationAssetFactory.ISeatReservationAsset[];
}
/**
 *
 * @memberof tobereplaced$
 */
export declare function create(args: {
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
    assets: SeatReservationAssetFactory.ISeatReservationAsset[];
}): ICOASeatReservationAuthorization;
