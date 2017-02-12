/// <reference types="mongoose" />
import Asset from "../asset";
import Authorization from "../authorization";
import ObjectId from "../objectId";
import Ownership from "../ownership";
/**
 * 座席予約資産
 *
 * TODO 座席予約資産の属性はこれでよいか
 *
 *
 * @class SeatReservationAsset
 * @extends {Asset}
 */
export default class SeatReservationAsset extends Asset {
    readonly _id: ObjectId;
    readonly ownership: Ownership;
    readonly authorizations: Array<Authorization>;
    readonly performance: string;
    readonly section: string;
    readonly seat_code: string;
    readonly ticket_code: string;
    readonly ticket_name_ja: string;
    readonly ticket_name_en: string;
    readonly ticket_name_kana: string;
    readonly std_price: number;
    readonly add_price: number;
    readonly dis_price: number;
    readonly sale_price: number;
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
    constructor(_id: ObjectId, ownership: Ownership, authorizations: Array<Authorization>, performance: string, section: string, seat_code: string, ticket_code: string, ticket_name_ja: string, ticket_name_en: string, ticket_name_kana: string, std_price: number, add_price: number, dis_price: number, sale_price: number);
}
