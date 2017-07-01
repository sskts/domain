/**
 * COA座席仮予約ファクトリー
 * todo jsdoc
 *
 * @namespace factory/authorization/coaSeatReservation
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as SeatReservationAssetFactory from '../asset/seatReservation';
import * as AuthorizationFactory from '../authorization';
import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

/**
 * 座席予約承認に必要な資産インターフェース
 */
export type IAsset = SeatReservationAssetFactory.IAssetWithoutDetails;

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
    assets: IAsset[];
}): IAuthorization {
    if (_.isEmpty(args.owner_from)) throw new ArgumentNullError('owner_from');
    if (_.isEmpty(args.owner_to)) throw new ArgumentNullError('owner_to');
    if (_.isEmpty(args.coa_theater_code)) throw new ArgumentNullError('coa_theater_code');
    if (_.isEmpty(args.coa_date_jouei)) throw new ArgumentNullError('coa_date_jouei');
    if (_.isEmpty(args.coa_title_code)) throw new ArgumentNullError('coa_title_code');
    if (_.isEmpty(args.coa_title_branch_num)) throw new ArgumentNullError('coa_title_branch_num');
    if (_.isEmpty(args.coa_time_begin)) throw new ArgumentNullError('coa_time_begin');
    if (_.isEmpty(args.coa_screen_code)) throw new ArgumentNullError('coa_screen_code');

    if (!_.isNumber(args.coa_tmp_reserve_num)) throw new ArgumentError('coa_tmp_reserve_num', 'coa_tmp_reserve_num should be number');
    if (!_.isNumber(args.price)) throw new ArgumentError('price', 'price should be number');
    if (args.price <= 0) throw new ArgumentError('price', 'price should be greater than 0');

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
