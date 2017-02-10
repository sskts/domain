/// <reference types="mongoose" />
import Authorization from "../authorization";
import ObjectId from "../objectId";
/**
 * GMOオーソリ
 *
 *
 * @class GMOAuthorization
 * @extends {Authorization}
 */
export default class GMOAuthorization extends Authorization {
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
