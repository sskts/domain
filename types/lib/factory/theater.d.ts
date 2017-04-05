/**
 * 劇場ファクトリー
 *
 * @namespace TheaterFactory
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
import TheaterWebsiteGroup from './theaterWebsiteGroup';
/**
 * 必須フィールド
 * COAからインポートされる想定
 *
 * @interface IRequiredFields
 */
export interface IRequiredFields {
    id: string;
    name: MultilingualString;
    name_kana: string;
}
/**
 * GMO関連情報インターフェース
 *
 * @interface IGMO
 */
export interface IGMO {
    gmo: {
        site_id: string;
        shop_id: string;
        shop_pass: string;
    };
}
/**
 * ウェブサイト情報インターフェース
 *
 * @interface IWebsite
 */
export interface IWebsite {
    /**
     * ウェブサイト区分
     */
    group: TheaterWebsiteGroup;
    /**
     * ウェブサイト名
     */
    name: MultilingualString;
    /**
     * URL
     */
    url: string;
}
/**
 * 追加情報インターフェース
 *
 * @interface IOptionalFields
 */
export interface IOptionalFields {
    address: MultilingualString;
    /**
     * ウェブサイト情報リスト
     */
    websites: IWebsite[];
}
export declare type ITheater = IRequiredFields & IOptionalFields & IGMO;
/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @export
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 */
export declare function createFromCOA(theaterFromCOA: COA.MasterService.ITheaterResult): IRequiredFields;
