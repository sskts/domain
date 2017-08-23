import * as SeatReservationAssetFactory from '../asset/seatReservation';
import * as AuthorizationFactory from '../authorization';
/**
 * 座席予約承認に必要な資産インターフェース
 */
export declare type IAsset = SeatReservationAssetFactory.IAssetWithoutDetails;
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
 * @param {IAsset[]} assets 資産リスト(COA側では複数座席に対してひとつの仮予約番号が割り当てられるため)
 * @memberof factory/authorization/coaSeatReservation
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    coa_tmp_reserve_num: number;
    coa_theater_code: string;
    coa_date_jouei: string;
    coa_title_code: string;
    coa_title_branch_num: string;
    coa_time_begin: string;
    coa_screen_code: string;
    assets: IAsset[];
}
/**
 *
 * @memberof factory/authorization/coaSeatReservation
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
    assets: IAsset[];
}): IAuthorization;
