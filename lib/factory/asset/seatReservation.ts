/**
 * 座席予約資産ファクトリー
 *
 * @namespace factory/asset/seatReservation
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as AssetFactory from '../asset';
import AssetGroup from '../assetGroup';
import * as AuthorizationFactory from '../authorization';
import IMultilingualString from '../multilingualString';
import ObjectId from '../objectId';
import * as OwnershipFactory from '../ownership';

/**
 * 座席予約資産
 *
 * @interface ISeatReservationAsset
 * @extends {IAsset}
 * @memberof tobereplaced$
 */
export interface ISeatReservationAsset extends AssetFactory.IAsset {
    ownership: OwnershipFactory.IOwnership;
    /**
     * パフォーマンス
     */
    performance: string;
    /**
     * スクリーンセクション
     */
    section: string;
    /**
     * 座席コード
     */
    seat_code: string;
    /**
     * 券種コード
     */
    ticket_code: string;
    /**
     * 券種名
     */
    ticket_name: IMultilingualString;
    /**
     * 券種名(カナ)
     */
    ticket_name_kana: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価
     */
    add_price: number;
    /**
     * 割引額
     */
    dis_price: number;
    /**
     * 販売単価
     */
    sale_price: number;
    /**
     * ムビチケ計上単価
     */
    mvtk_app_price: number;
    /**
     * メガネ単価
     */
    add_glasses: number;
    /**
     * ムビチケ映写方式区分
     */
    kbn_eisyahousiki: string;
    /**
     * ムビチケ購入管理番号
     */
    mvtk_num: string;
    /**
     * ムビチケ電子券区分
     */
    mvtk_kbn_denshiken: string;
    /**
     * ムビチケ前売券区分
     */
    mvtk_kbn_maeuriken: string;
    /**
     * ムビチケ券種区分
     */
    mvtk_kbn_kensyu: string;
    /**
     * ムビチケ販売単価
     */
    mvtk_sales_price: number;
}

/**
 * 座席予約資産を作成する
 *
 * @returns {SeatReservationAsset}
 * @memberof tobereplaced$
 */
// tslint:disable-next-line:cyclomatic-complexity
export function create(args: {
    id?: string,
    ownership: OwnershipFactory.IOwnership;
    authorizations?: AuthorizationFactory.IAuthorization[];
    performance: string;
    section: string;
    seat_code: string;
    ticket_code: string;
    ticket_name: IMultilingualString;
    ticket_name_kana: string;
    std_price: number;
    add_price: number;
    dis_price: number;
    sale_price: number;
    mvtk_app_price: number;
    add_glasses: number;
    kbn_eisyahousiki: string;
    mvtk_num: string;
    mvtk_kbn_denshiken: string;
    mvtk_kbn_maeuriken: string;
    mvtk_kbn_kensyu: string;
    mvtk_sales_price: number;
}): ISeatReservationAsset {
    if (!_.isString(args.section)) throw new ArgumentError('section', 'section should be string');
    if (!_.isString(args.ticket_name_kana)) throw new ArgumentError('ticket_name_kana', 'ticket_name_kana should be string');
    if (!_.isString(args.mvtk_num)) throw new ArgumentError('mvtk_num', 'mvtk_num should be string');
    if (!_.isString(args.ticket_name.en)) throw new ArgumentError('ticket_name.en', 'ticket_name.en should be string');

    if (_.isEmpty(args.performance)) throw new ArgumentNullError('performance');
    if (_.isEmpty(args.seat_code)) throw new ArgumentNullError('seat_code');
    if (_.isEmpty(args.ticket_code)) throw new ArgumentNullError('ticket_code');
    if (_.isEmpty(args.ticket_name.ja)) throw new ArgumentNullError('ticket_name.ja');
    if (_.isEmpty(args.kbn_eisyahousiki)) throw new ArgumentNullError('kbn_eisyahousiki');
    if (_.isEmpty(args.mvtk_kbn_denshiken)) throw new ArgumentNullError('mvtk_kbn_denshiken');
    if (_.isEmpty(args.mvtk_kbn_maeuriken)) throw new ArgumentNullError('mvtk_kbn_maeuriken');
    if (_.isEmpty(args.mvtk_kbn_kensyu)) throw new ArgumentNullError('mvtk_kbn_kensyu');

    if (!_.isNumber(args.std_price)) throw new ArgumentError('std_price', 'std_price should be number');
    if (!_.isNumber(args.add_price)) throw new ArgumentError('add_price', 'add_price should be number');
    if (!_.isNumber(args.dis_price)) throw new ArgumentError('dis_price', 'dis_price should be number');
    if (!_.isNumber(args.sale_price)) throw new ArgumentError('sale_price', 'sale_price should be number');
    if (!_.isNumber(args.mvtk_app_price)) throw new ArgumentError('mvtk_app_price', 'mvtk_app_price should be number');
    if (!_.isNumber(args.add_glasses)) throw new ArgumentError('add_glasses', 'add_glasses should be number');
    if (!_.isNumber(args.mvtk_sales_price)) throw new ArgumentError('mvtk_sales_price', 'mvtk_sales_price should be number');

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
        ticket_name: args.ticket_name,
        ticket_name_kana: args.ticket_name_kana,
        std_price: args.std_price,
        add_price: args.add_price,
        dis_price: args.dis_price,
        sale_price: args.sale_price,
        mvtk_app_price: args.mvtk_app_price,
        add_glasses: args.add_glasses,
        kbn_eisyahousiki: args.kbn_eisyahousiki,
        mvtk_num: args.mvtk_num,
        mvtk_kbn_denshiken: args.mvtk_kbn_denshiken,
        mvtk_kbn_maeuriken: args.mvtk_kbn_maeuriken,
        mvtk_kbn_kensyu: args.mvtk_kbn_kensyu,
        mvtk_sales_price: args.mvtk_sales_price
    };
}
