"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:variable-name
const assetGroup_1 = require("./assetGroup");
const objectId_1 = require("./objectId");
/**
 * 資産
 *
 * @class Asset
 *
 * @param {string} id ID
 * @param {AssetGroup} group 資産グループ
 * @param {Ownership} ownership 所有権
 * @param {number} price 価格
 * @param {Array<Authorization>} authorizations 承認リスト
 */
class Asset {
    constructor(id, group, ownership, price, authorizations) {
        this.id = id;
        this.group = group;
        this.ownership = ownership;
        this.price = price;
        this.authorizations = authorizations;
        // todo validation
    }
}
(function (Asset) {
    /**
     * 座席予約資産
     *
     * todo 座席予約資産の属性はこれでよいか
     *
     * @class SeatReservationAsset
     * @extends {Asset}
     *
     * @param {string} id
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
     */
    // tslint:disable-next-line:max-classes-per-file
    class SeatReservationAsset extends Asset {
        constructor(id, ownership, authorizations, performance, section, seat_code, ticket_code, ticket_name_ja, ticket_name_en, ticket_name_kana, std_price, add_price, dis_price, sale_price) {
            // todo validation
            super(id, assetGroup_1.default.SEAT_RESERVATION, ownership, sale_price, authorizations);
            this.id = id;
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
    Asset.SeatReservationAsset = SeatReservationAsset;
    /**
     * 座席予約資産を作成する
     *
     * @returns {SeatReservationAsset}
     * @memberof Asset
     */
    function createSeatReservation(args) {
        return new SeatReservationAsset((args.id) ? args.id : objectId_1.default().toString(), args.ownership, args.authorizations, args.performance, args.section, args.seat_code, args.ticket_code, args.ticket_name_ja, args.ticket_name_en, args.ticket_name_kana, args.std_price, args.add_price, args.dis_price, args.sale_price);
    }
    Asset.createSeatReservation = createSeatReservation;
})(Asset || (Asset = {}));
exports.default = Asset;
