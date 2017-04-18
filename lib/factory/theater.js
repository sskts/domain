"use strict";
/**
 * 劇場ファクトリー
 *
 * @namespace factory/theater
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 * @memberof tobereplaced$
 */
function createFromCOA(theaterFromCOA) {
    return {
        id: theaterFromCOA.theater_code,
        name: {
            ja: theaterFromCOA.theater_name,
            en: theaterFromCOA.theater_name_eng
        },
        name_kana: theaterFromCOA.theater_name_kana
    };
}
exports.createFromCOA = createFromCOA;
