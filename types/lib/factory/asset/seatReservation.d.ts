import * as AssetFactory from '../asset';
import * as AuthorizationFactory from '../authorization';
import IMultilingualString from '../multilingualString';
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
export declare type IAssetWithoutDetails = IAssetBase & IMvtkFields;
/**
 * 座席予約資産
 *
 * @interface IAsset
 * @extends {IAsset}
 * @memberof factory/asset/seatReservation
 */
export declare type IAsset = IAssetWithoutDetails & IDetails;
/**
 * 座席予約資産を作成する
 *
 * @returns {Asset}
 * @memberof factory/asset/seatReservation
 */
export declare function create(args: {
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
}): IAsset;
export declare function createWithoutDetails(args: {
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
}): IAssetWithoutDetails;
