/**
 * 劇場ファクトリー
 *
 * @namespace TheaterFacroty
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';

export interface ITheater {
    id: string;
    name: MultilingualString;
    name_kana: string;
    address: MultilingualString;
}

/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @export
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheater}
 */
export function createFromCOA(theaterFromCOA: COA.MasterService.TheaterResult): ITheater {
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
