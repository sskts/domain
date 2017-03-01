"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:variable-name
const validator = require("validator");
const authorizationGroup_1 = require("./authorizationGroup");
const objectId_1 = require("./objectId");
/**
 * 承認
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @class Authorization
 *
 * @param {string} id
 * @param {AuthorizationGroup} group 承認グループ
 * @param {number} price 承認価格
 * @param {string} owner_from 資産を差し出す所有者
 * @param {string} owner_to 資産を受け取る所有者
 */
class Authorization {
    constructor(id, group, price, owner_from, owner_to) {
        this.id = id;
        this.group = group;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
        // todo validation
    }
}
(function (Authorization) {
    /**
     * 資産承認
     * 誰が、誰に対して、何(資産)の所有を、承認するのか
     *
     *
     * @class AssetAuthorization
     * @extends {Authorization}
     */
    // tslint:disable-next-line:max-classes-per-file
    class AssetAuthorization extends Authorization {
        /**
         * Creates an instance of AssetAuthorization.
         *
         * @param {string} id
         * @param {Asset} asset 資産
         * @param {number} price 資産価格
         * @param {string} owner_from 誰が
         * @param {string} owner_to 誰に対して
         *
         * @memberOf AssetAuthorization
         */
        constructor(id, asset, price, owner_from, owner_to) {
            super(id, authorizationGroup_1.default.ASSET, price, owner_from, owner_to);
            this.id = id;
            this.asset = asset;
            this.price = price;
            this.owner_from = owner_from;
            this.owner_to = owner_to;
            // todo validation
        }
    }
    Authorization.AssetAuthorization = AssetAuthorization;
    /**
     * COA座席仮予約
     *
     *
     * @class COASeatReservationAuthorization
     * @extends {Authorization}
     */
    // tslint:disable-next-line:max-classes-per-file
    class COASeatReservationAuthorization extends Authorization {
        /**
         * Creates an instance of COASeatReservationAuthorization.
         *
         * @param {string} id
         * @param {number} coa_tmp_reserve_num
         * @param {string} coa_theater_code
         * @param {string} coa_date_jouei
         * @param {string} coa_title_code
         * @param {string} coa_title_branch_num
         * @param {string} coa_time_begin
         * @param {string} coa_screen_code
         * @param {number} price
         * @param {string} owner_from
         * @param {string} owner_to
         * @param {Asset.SeatReservation[]} assets 資産リスト(COA側では複数座席に対してひとつの仮予約番号が割り当てられるため)
         *
         * @memberOf COASeatReservationAuthorization
         */
        constructor(id, coa_tmp_reserve_num, coa_theater_code, coa_date_jouei, coa_title_code, coa_title_branch_num, coa_time_begin, coa_screen_code, price, owner_from, owner_to, assets) {
            super(id, authorizationGroup_1.default.COA_SEAT_RESERVATION, price, owner_from, owner_to);
            this.id = id;
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
            // todo validation
            if (validator.isEmpty(coa_tmp_reserve_num.toString()))
                throw new Error('coa_tmp_reserve_num required.');
            if (validator.isEmpty(coa_theater_code))
                throw new Error('coa_theater_code required.');
            if (validator.isEmpty(coa_date_jouei))
                throw new Error('coa_date_jouei required.');
            if (validator.isEmpty(coa_title_code))
                throw new Error('coa_title_code required.');
            if (validator.isEmpty(coa_title_branch_num))
                throw new Error('coa_title_branch_num required.');
            if (validator.isEmpty(coa_time_begin))
                throw new Error('coa_time_begin required.');
            if (validator.isEmpty(coa_screen_code))
                throw new Error('coa_screen_code required.');
            if (validator.isEmpty(price.toString()))
                throw new Error('price required.');
            if (validator.isEmpty(owner_from.toString()))
                throw new Error('owner_from required.');
            if (validator.isEmpty(owner_to.toString()))
                throw new Error('owner_to required.');
        }
    }
    Authorization.COASeatReservationAuthorization = COASeatReservationAuthorization;
    /**
     * GMOオーソリ
     *
     *
     * @class GMOAuthorization
     * @extends {Authorization}
     */
    // tslint:disable-next-line:max-classes-per-file
    class GMOAuthorization extends Authorization {
        /**
         * Creates an instance of GMOAuthorization.
         *
         * @param {string} id
         * @param {number} price
         * @param {string} owner_from
         * @param {string} owner_to
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
        constructor(id, price, owner_from, owner_to, gmo_shop_id, gmo_shop_pass, gmo_order_id, gmo_amount, gmo_access_id, gmo_access_pass, gmo_job_cd, gmo_pay_type) {
            super(id, authorizationGroup_1.default.GMO, price, owner_from, owner_to);
            this.id = id;
            this.price = price;
            this.owner_from = owner_from;
            this.owner_to = owner_to;
            this.gmo_shop_id = gmo_shop_id;
            this.gmo_shop_pass = gmo_shop_pass;
            this.gmo_order_id = gmo_order_id;
            this.gmo_amount = gmo_amount;
            this.gmo_access_id = gmo_access_id;
            this.gmo_access_pass = gmo_access_pass;
            this.gmo_job_cd = gmo_job_cd;
            this.gmo_pay_type = gmo_pay_type;
            // todo validation
        }
    }
    Authorization.GMOAuthorization = GMOAuthorization;
    function createGMO(args) {
        return new GMOAuthorization((args.id) ? args.id : objectId_1.default().toString(), args.price, args.owner_from, args.owner_to, args.gmo_shop_id, args.gmo_shop_pass, args.gmo_order_id, args.gmo_amount, args.gmo_access_id, args.gmo_access_pass, args.gmo_job_cd, args.gmo_pay_type);
    }
    Authorization.createGMO = createGMO;
    function createCOASeatReservation(args) {
        return new COASeatReservationAuthorization((args.id) ? args.id : objectId_1.default().toString(), args.coa_tmp_reserve_num, args.coa_theater_code, args.coa_date_jouei, args.coa_title_code, args.coa_title_branch_num, args.coa_time_begin, args.coa_screen_code, args.price, args.owner_from, args.owner_to, args.assets);
    }
    Authorization.createCOASeatReservation = createCOASeatReservation;
})(Authorization || (Authorization = {}));
exports.default = Authorization;
