"use strict";
/**
 * 劇場ファクトリー
 * todo jsdoc
 *
 * @namespace factory/theater
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 * @memberof factory/theater
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
function createInitialOptionalFields() {
    return {
        address: {
            en: '',
            ja: ''
        },
        websites: [],
        gmo: {
            site_id: '',
            shop_id: '',
            shop_pass: ''
        }
    };
}
exports.createInitialOptionalFields = createInitialOptionalFields;
