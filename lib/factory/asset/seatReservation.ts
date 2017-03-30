/**
 * 座席予約資産ファクトリー
 *
 * @namespace SeatReservationAssetFactory
 */
import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

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
 * @param {number} std_price 標準単価
 * @param {number} add_price 加算単価
 * @param {number} dis_price 割引額
 * @param {number} sale_price 販売単価
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
    if (_.isEmpty(args.performance)) throw new ArgumentNullError('performance');
    if (_.isEmpty(args.seat_code)) throw new ArgumentNullError('seat_code');
    if (_.isEmpty(args.ticket_code)) throw new ArgumentNullError('ticket_code');

    if (!_.isNumber(args.std_price)) throw new ArgumentError('std_price', 'std_price should be number');
    if (!_.isNumber(args.add_price)) throw new ArgumentError('add_price', 'add_price should be number');
    if (!_.isNumber(args.dis_price)) throw new ArgumentError('dis_price', 'dis_price should be number');
    if (!_.isNumber(args.sale_price)) throw new ArgumentError('sale_price', 'sale_price should be number');

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
