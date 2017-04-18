/**
 * 劇場ファクトリー
 *
 * @namespace factory/theater
 */

import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
import TheaterWebsiteGroup from './theaterWebsiteGroup';

/**
 * 必須フィールド
 * COAからインポートされる想定
 *
 * @interface IRequiredFields
 * @memberof tobereplaced$
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
 * @memberof tobereplaced$
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
 * @memberof tobereplaced$
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
 * @memberof tobereplaced$
 */
export interface IOptionalFields {
    address: MultilingualString;
    /**
     * ウェブサイト情報リスト
     */
    websites: IWebsite[];
}

export type ITheater = IRequiredFields & IOptionalFields & IGMO;

/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 * @memberof tobereplaced$
 */
export function createFromCOA(theaterFromCOA: COA.MasterService.ITheaterResult): IRequiredFields {
    return {
        id: theaterFromCOA.theater_code,
        name: {
            ja: theaterFromCOA.theater_name,
            en: theaterFromCOA.theater_name_eng
        },
        name_kana: theaterFromCOA.theater_name_kana
    };
}
