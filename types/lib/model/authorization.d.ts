/// <reference types="mongoose" />
import Asset from './asset';
import AuthorizationGroup from './authorizationGroup';
import ObjectId from './objectId';
/**
 * 承認
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @class Authorization
 *
 * @param {ObjectId} _id
 * @param {AuthorizationGroup} group 承認グループ
 * @param {number} price 承認価格
 * @param {ObjectId} owner_from 資産を差し出す所有者
 * @param {ObjectId} owner_to 資産を受け取る所有者
 */
declare class Authorization {
    readonly _id: ObjectId;
    readonly group: AuthorizationGroup;
    readonly price: number;
    readonly owner_from: ObjectId;
    readonly owner_to: ObjectId;
    constructor(_id: ObjectId, group: AuthorizationGroup, price: number, owner_from: ObjectId, owner_to: ObjectId);
}
declare namespace Authorization {
    /**
     * 資産承認
     * 誰が、誰に対して、何(資産)の所有を、承認するのか
     *
     *
     * @class AssetAuthorization
     * @extends {Authorization}
     */
    class AssetAuthorization extends Authorization {
        readonly _id: ObjectId;
        readonly asset: Asset;
        readonly price: number;
        readonly owner_from: ObjectId;
        readonly owner_to: ObjectId;
        /**
         * Creates an instance of AssetAuthorization.
         *
         * @param {ObjectId} _id
         * @param {Asset} asset 資産
         * @param {number} price 資産価格
         * @param {ObjectId} owner_from 誰が
         * @param {ObjectId} owner_to 誰に対して
         *
         * @memberOf AssetAuthorization
         */
        constructor(_id: ObjectId, asset: Asset, price: number, owner_from: ObjectId, owner_to: ObjectId);
    }
    /**
     * COA座席仮予約
     *
     *
     * @class COASeatReservationAuthorization
     * @extends {Authorization}
     */
    class COASeatReservationAuthorization extends Authorization {
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
        readonly assets: Asset.SeatReservationAsset[];
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
        constructor(_id: ObjectId, coa_tmp_reserve_num: number, coa_theater_code: string, coa_date_jouei: string, coa_title_code: string, coa_title_branch_num: string, coa_time_begin: string, coa_screen_code: string, price: number, owner_from: ObjectId, owner_to: ObjectId, assets: Asset.SeatReservationAsset[]);
    }
    /**
     * GMOオーソリ
     *
     *
     * @class GMOAuthorization
     * @extends {Authorization}
     */
    class GMOAuthorization extends Authorization {
        readonly _id: ObjectId;
        readonly price: number;
        readonly owner_from: ObjectId;
        readonly owner_to: ObjectId;
        readonly gmo_shop_id: string;
        readonly gmo_shop_pass: string;
        readonly gmo_order_id: string;
        readonly gmo_amount: number;
        readonly gmo_access_id: string;
        readonly gmo_access_pass: string;
        readonly gmo_job_cd: string;
        readonly gmo_pay_type: string;
        /**
         * Creates an instance of GMOAuthorization.
         *
         * @param {ObjectId} _id
         * @param {number} price
         * @param {ObjectId} owner_from
         * @param {ObjectId} owner_to
         * @param {string} gmo_shop_id
         * @param {string} gmo_shop_pass
         * @param {string} gmo_order_id
         * @param {number} gmo_amount
         * @param {string} gmo_access_id
         * @param {string} gmo_access_pass
         * @param {string} gmo_job_cd
         * @param {string} gmo_pay_type
         *
         * @memberOf GMOAuthorization
         */
        constructor(_id: ObjectId, price: number, owner_from: ObjectId, owner_to: ObjectId, gmo_shop_id: string, gmo_shop_pass: string, gmo_order_id: string, gmo_amount: number, gmo_access_id: string, gmo_access_pass: string, gmo_job_cd: string, gmo_pay_type: string);
    }
    interface IGMOAuthorization {
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
    }
    function createGMO(args: IGMOAuthorization): GMOAuthorization;
    interface ICOASeatReservationAuthorization {
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
        assets: Asset.SeatReservationAsset[];
    }
    function createCOASeatReservation(args: ICOASeatReservationAuthorization): COASeatReservationAuthorization;
}
export default Authorization;
