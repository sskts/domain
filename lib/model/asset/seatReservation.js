"use strict";
const asset_1 = require("../asset");
const assetGroup_1 = require("../assetGroup");
/**
 * 座席予約資産
 *
 * TODO 座席予約資産の属性はこれでよいか
 *
 *
 * @class SeatReservationAsset
 * @extends {Asset}
 */
class SeatReservationAsset extends asset_1.default {
    /**
     * Creates an instance of SeatReservationAsset.
     *
     * @param {ObjectId} _id
     * @param {Ownership} ownership 所有権
     * @param {Array<Authorization>} authorizations 承認リスト
     * @param {string} performance パフォーマンス
     * @param {string} section スクリーンセクション
     * @param {string} seat_code 座席コード
     * @param {string} ticket_code 券種コード
     * @param {string} ticket_name_ja
     * @param {string} ticket_name_en
     * @param {string} ticket_name_kana
     * @param {number} std_price
     * @param {number} add_price
     * @param {number} dis_price
     * @param {number} sale_price
     *
     * @memberOf SeatReservationAsset
     */
    constructor(_id, ownership, authorizations, performance, section, seat_code, ticket_code, ticket_name_ja, ticket_name_en, ticket_name_kana, std_price, add_price, dis_price, sale_price) {
        // TODO validation
        super(_id, assetGroup_1.default.SEAT_RESERVATION, ownership, sale_price, authorizations);
        this._id = _id;
        this.ownership = ownership;
        this.authorizations = authorizations;
        this.performance = performance;
        this.section = section;
        this.seat_code = seat_code;
        this.ticket_code = ticket_code;
        this.ticket_name_ja = ticket_name_ja;
        this.ticket_name_en = ticket_name_en;
        this.ticket_name_kana = ticket_name_kana;
        this.std_price = std_price;
        this.add_price = add_price;
        this.dis_price = dis_price;
        this.sale_price = sale_price;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatReservationAsset;
