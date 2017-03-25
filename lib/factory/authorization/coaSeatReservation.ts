/**
 * COA座席仮予約ファクトリー
 *
 * @namespace COASeatReservationAuthorizationFactory
 */
import * as validator from 'validator';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as SeatReservationAssetFactory from '../asset/seatReservation';
import * as AuthorizationFactory from '../authorization';
import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

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

export function create(args: {
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
}): ICOASeatReservationAuthorization {
    // todo validation
    if (validator.isEmpty(args.coa_tmp_reserve_num.toString())) throw new ArgumentNullError('coa_tmp_reserve_num');
    if (validator.isEmpty(args.coa_theater_code)) throw new ArgumentNullError('coa_theater_code');
    if (validator.isEmpty(args.coa_date_jouei)) throw new ArgumentNullError('coa_date_jouei');
    if (validator.isEmpty(args.coa_title_code)) throw new ArgumentNullError('coa_title_code');
    if (validator.isEmpty(args.coa_title_branch_num)) throw new ArgumentNullError('coa_title_branch_num');
    if (validator.isEmpty(args.coa_time_begin)) throw new ArgumentNullError('coa_time_begin');
    if (validator.isEmpty(args.coa_screen_code)) throw new ArgumentNullError('coa_screen_code');
    if (validator.isEmpty(args.price.toString())) throw new ArgumentNullError('price');
    if (validator.isEmpty(args.owner_from.toString())) throw new ArgumentNullError('owner_from');
    if (validator.isEmpty(args.owner_to.toString())) throw new ArgumentNullError('owner_to');

    if (validator.isEmpty(args.price.toString())) throw new ArgumentError('price', 'price should be number');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: AuthorizationGroup.COA_SEAT_RESERVATION,
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
