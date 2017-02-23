import AssetGroup from './assetGroup';
import Authorization from './authorization';
import Ownership from './ownership';
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
declare class Asset {
    readonly id: string;
    readonly group: AssetGroup;
    readonly ownership: Ownership;
    readonly price: number;
    readonly authorizations: Authorization[];
    constructor(id: string, group: AssetGroup, ownership: Ownership, price: number, authorizations: Authorization[]);
}
declare namespace Asset {
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
    class SeatReservationAsset extends Asset {
        readonly id: string;
        readonly ownership: Ownership;
        readonly authorizations: Authorization[];
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
        constructor(id: string, ownership: Ownership, authorizations: Authorization[], performance: string, section: string, seat_code: string, ticket_code: string, ticket_name_ja: string, ticket_name_en: string, ticket_name_kana: string, std_price: number, add_price: number, dis_price: number, sale_price: number);
    }
    interface ISeatReservationAsset {
        id?: string;
        ownership: Ownership;
        authorizations: Authorization[];
        performance: string;
        section: string;
        seat_code: string;
        ticket_code: string;
        ticket_name_ja: string;
        ticket_name_en: string;
        ticket_name_kana: string;
        std_price: number;
        add_price: number;
        dis_price: number;
        sale_price: number;
    }
    /**
     * 座席予約資産を作成する
     *
     * @returns {SeatReservationAsset}
     * @memberof Asset
     */
    function createSeatReservation(args: ISeatReservationAsset): SeatReservationAsset;
}
export default Asset;
