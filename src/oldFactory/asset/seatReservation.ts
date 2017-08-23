/**
 * 座席予約資産ファクトリー
 * todo jsdoc整備
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
import * as TransactionInquiryKeyFactory from '../transactionInquiryKey';

export interface IDetails {
    theater: string;
    screen: string;
    film: string;
    performance_day: string;
    performance_time_start: string;
    performance_time_end: string;
    theater_name: IMultilingualString;
    theater_name_kana: string;
    theater_address: IMultilingualString;
    screen_name: IMultilingualString;
    film_name: IMultilingualString;
    film_name_kana: string;
    film_name_short: string;
    film_name_original: string;
    film_minutes: number;
    film_kbn_eirin: string;
    film_kbn_eizou: string;
    film_kbn_joueihousiki: string;
    film_kbn_jimakufukikae: string;
    film_copyright: string;
    transaction_inquiry_key: TransactionInquiryKeyFactory.ITransactionInquiryKey;
}

export interface IMvtkFields {
    mvtk_app_price: number;
    kbn_eisyahousiki: string;
    mvtk_num: string;
    mvtk_kbn_denshiken: string;
    mvtk_kbn_maeuriken: string;
    mvtk_kbn_kensyu: string;
    mvtk_sales_price: number;
}

export interface IAssetBase extends AssetFactory.IAsset {
    performance: string;
    screen_section: string;
    seat_code: string;
    ticket_code: string;
    ticket_name: IMultilingualString;
    ticket_name_kana: string;
    std_price: number;
    add_price: number;
    dis_price: number;
    sale_price: number;
    add_glasses: number;
}

export type IAssetWithoutDetails = IAssetBase & IMvtkFields;

/**
 * 座席予約資産
 *
 * @interface IAsset
 * @extends {IAsset}
 * @memberof factory/asset/seatReservation
 */
export type IAsset = IAssetWithoutDetails & IDetails;

/**
 * 座席予約資産を作成する
 *
 * @returns {Asset}
 * @memberof factory/asset/seatReservation
 */
// tslint:disable-next-line:cyclomatic-complexity
export function create(args: {
    id?: string;
    ownership: OwnershipFactory.IOwnership;
    authorizations?: AuthorizationFactory.IAuthorization[];
    performance: string;
    performance_day: string;
    performance_time_start: string;
    performance_time_end: string;
    theater: string;
    theater_name: IMultilingualString;
    theater_name_kana: string;
    theater_address: IMultilingualString;
    screen: string;
    screen_name: IMultilingualString;
    screen_section: string;
    seat_code: string;
    film: string;
    film_name: IMultilingualString;
    film_name_kana: string;
    film_name_short: string;
    film_name_original: string;
    film_minutes: number;
    film_kbn_eirin: string;
    film_kbn_eizou: string;
    film_kbn_joueihousiki: string;
    film_kbn_jimakufukikae: string;
    film_copyright: string;
    transaction_inquiry_key: TransactionInquiryKeyFactory.ITransactionInquiryKey;
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
}): IAsset {
    const seatReservationAssetWithoutDetails = createWithoutDetails(args);

    // todo validation

    return {
        ...seatReservationAssetWithoutDetails,
        ...{
            performance_day: args.performance_day,
            performance_time_start: args.performance_time_start,
            performance_time_end: args.performance_time_end,
            theater: args.theater,
            theater_name: args.theater_name,
            theater_name_kana: args.theater_name_kana,
            theater_address: args.theater_address,
            screen: args.screen,
            screen_name: args.screen_name,
            film: args.film,
            film_name: args.film_name,
            film_name_kana: args.film_name_kana,
            film_name_short: args.film_name_short,
            film_name_original: args.film_name_original,
            film_minutes: args.film_minutes,
            film_kbn_eirin: args.film_kbn_eirin,
            film_kbn_eizou: args.film_kbn_eizou,
            film_kbn_joueihousiki: args.film_kbn_joueihousiki,
            film_kbn_jimakufukikae: args.film_kbn_jimakufukikae,
            film_copyright: args.film_copyright,
            transaction_inquiry_key: args.transaction_inquiry_key
        }
    };
}

// tslint:disable-next-line:cyclomatic-complexity
export function createWithoutDetails(args: {
    id?: string;
    ownership: OwnershipFactory.IOwnership;
    authorizations?: AuthorizationFactory.IAuthorization[];
    performance: string;
    screen_section: string;
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
}): IAssetWithoutDetails {
    if (!_.isString(args.screen_section)) throw new ArgumentError('screen_section', 'screen_section should be string');
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
        screen_section: args.screen_section,
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
