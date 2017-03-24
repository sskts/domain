/**
 * 座席予約資産ファクトリー
 *
 * @namespace SeatReservationAssetFactory
 */
import * as AssetFactory from '../asset';
import AssetGroup from '../assetGroup';
import * as AuthorizationFactory from '../authorization';
import ObjectId from '../objectId';
import * as OwnershipFactory from '../ownership';

/**
 * 座席予約資産
 *
 * todo 座席予約資産の属性はこれでよいか
 *
 * @export
 * @interface ISeatReservationAsset
 * @extends {IAsset}
 *
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
export interface ISeatReservationAsset extends AssetFactory.IAsset {
    ownership: OwnershipFactory.IOwnership;
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
 */
export function create(args: {
    id?: string,
    ownership: OwnershipFactory.IOwnership;
    authorizations?: AuthorizationFactory.IAuthorization[];
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
}): ISeatReservationAsset {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        ownership: args.ownership,
        group: AssetGroup.SEAT_RESERVATION,
        price: args.sale_price,
        authorizations: (args.authorizations === undefined) ? [] : args.authorizations,
        performance: args.performance,
        section: args.section,
        seat_code: args.seat_code,
        ticket_code: args.ticket_code,
        ticket_name_ja: args.ticket_name_ja,
        ticket_name_en: args.ticket_name_en,
        ticket_name_kana: args.ticket_name_kana,
        std_price: args.std_price,
        add_price: args.add_price,
        dis_price: args.dis_price,
        sale_price: args.sale_price
    };
}