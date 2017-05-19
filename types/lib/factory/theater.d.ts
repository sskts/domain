/**
 * 劇場ファクトリー
 * todo jsdoc
 *
 * @namespace factory/theater
 */
import * as COA from '@motionpicture/coa-service';
import IMultilingualString from './multilingualString';
import TheaterWebsiteGroup from './theaterWebsiteGroup';
/**
 * 必須フィールド
 * COAからインポートされる想定
 *
 * @interface IRequiredFields
 * @memberof factory/theater
 */
export interface IRequiredFields {
    id: string;
    name: IMultilingualString;
    name_kana: string;
}
/**
 * GMO関連情報インターフェース
 *
 * @interface IGMO
 * @memberof factory/theater
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
 * @memberof factory/theater
 */
export interface IWebsite {
    /**
     * ウェブサイト区分
     */
    group: TheaterWebsiteGroup;
    /**
     * ウェブサイト名
     */
    name: IMultilingualString;
    /**
     * URL
     */
    url: string;
}
/**
 * 追加情報インターフェース
 *
 * @interface IOptionalFields
 * @memberof factory/theater
 */
export interface IOptionalFields {
    address: IMultilingualString;
    /**
     * ウェブサイト情報リスト
     */
    websites: IWebsite[];
}
export declare type ITheater = IRequiredFields & IOptionalFields & IGMO;
/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 * @memberof factory/theater
 */
export declare function createFromCOA(theaterFromCOA: COA.MasterService.ITheaterResult): IRequiredFields;
export declare function createInitialOptionalFields(): IOptionalFields & IGMO;
