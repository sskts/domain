"use strict";
const authorization_1 = require("../authorization");
const authorizationGroup_1 = require("../authorizationGroup");
/**
 * GMOオーソリ
 *
 *
 * @class GMOAuthorization
 * @extends {Authorization}
 */
class GMOAuthorization extends authorization_1.default {
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
    constructor(_id, price, owner_from, owner_to, gmo_shop_id, gmo_shop_pass, gmo_order_id, gmo_amount, gmo_access_id, gmo_access_pass, gmo_job_cd, gmo_pay_type) {
        super(_id, authorizationGroup_1.default.GMO, price, owner_from, owner_to);
        this._id = _id;
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
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GMOAuthorization;
