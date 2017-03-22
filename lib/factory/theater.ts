/**
 * 劇場ファクトリー
 *
 * @namespace TheaterFactory
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';

export interface ITheaterWithoutGMO {
    id: string;
    name: MultilingualString;
    name_kana: string;
    address: MultilingualString;
}

export type ITheater = ITheaterWithoutGMO & {
    gmo_site_id: string;
    gmo_shop_id: string;
    gmo_shop_pass: string;
};

/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @export
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 */
export function createFromCOA(theaterFromCOA: COA.MasterService.TheaterResult): ITheaterWithoutGMO {
    return {
        id: theaterFromCOA.theater_code,
        name: {
            ja: theaterFromCOA.theater_name,
            en: theaterFromCOA.theater_name_eng
        },
        name_kana: theaterFromCOA.theater_name_kana,
        address: {
            ja: '',
            en: ''
        }
    };
}
