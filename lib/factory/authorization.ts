/**
 * 承認ファクトリー
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @namespace AuthorizationFacroty
 */
import * as validator from 'validator';
import * as Asset from './asset';
import AuthorizationGroup from './authorizationGroup';
import ObjectId from './objectId';

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

// 後に何かmemberが増えるかもしれない
export interface IAssetAuthorization extends IAuthorization { // tslint:disable-line:no-empty-interface no-empty-interfaces
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

export function createGMO(args: {
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
}): IGMOAuthorization {
    return {
        id: (args.id) ? args.id : ObjectId().toString(),
        group: AuthorizationGroup.GMO,
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

export function createCOASeatReservation(args: {
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
}): ICOASeatReservationAuthorization {
    // todo validation
    if (validator.isEmpty(args.coa_tmp_reserve_num.toString())) throw new Error('coa_tmp_reserve_num required.');
    if (validator.isEmpty(args.coa_theater_code)) throw new Error('coa_theater_code required.');
    if (validator.isEmpty(args.coa_date_jouei)) throw new Error('coa_date_jouei required.');
    if (validator.isEmpty(args.coa_title_code)) throw new Error('coa_title_code required.');
    if (validator.isEmpty(args.coa_title_branch_num)) throw new Error('coa_title_branch_num required.');
    if (validator.isEmpty(args.coa_time_begin)) throw new Error('coa_time_begin required.');
    if (validator.isEmpty(args.coa_screen_code)) throw new Error('coa_screen_code required.');
    if (validator.isEmpty(args.price.toString())) throw new Error('price required.');
    if (validator.isEmpty(args.owner_from.toString())) throw new Error('owner_from required.');
    if (validator.isEmpty(args.owner_to.toString())) throw new Error('owner_to required.');

    return {
        id: (args.id) ? args.id : ObjectId().toString(),
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
