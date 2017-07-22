"use strict";
/**
 * 劇場ファクトリー
 *
 * @namespace factory/place/movieTheater
 */
Object.defineProperty(exports, "__esModule", { value: true });
const placeType_1 = require("../placeType");
/**
 * COAのマスター抽出結果から作成する
 *
 * @param {COA.services.master.TheaterResult} theaterFromCOA
 * @param {COA.services.master.IScreenResult[]} screensFromCOA
 * @returns {IPlace}
 * @memberof factory/place/movieTheater
 */
function createFromCOA(theaterFromCOA, screensFromCOA) {
    return {
        branchCode: theaterFromCOA.theater_code,
        name: {
            ja: theaterFromCOA.theater_name,
            en: theaterFromCOA.theater_name_eng
        },
        kanaName: theaterFromCOA.theater_name_kana,
        containsPlace: screensFromCOA.map((screenFromCOA) => {
            return createScreeningRoomFromCOA(screenFromCOA);
        }),
        typeOf: placeType_1.default.MovieTheater
    };
}
exports.createFromCOA = createFromCOA;
/**
 * COAのスクリーン抽出結果から上映室を作成する
 *
 * @param {COA.services.master.ScreenResult} screenFromCOA
 * @returns {IScreeningRoom}
 * @memberof factory/place/movieTheater
 */
function createScreeningRoomFromCOA(screenFromCOA) {
    const sections = [];
    const sectionCodes = [];
    screenFromCOA.list_seat.forEach((seat) => {
        if (sectionCodes.indexOf(seat.seat_section) < 0) {
            sectionCodes.push(seat.seat_section);
            sections.push({
                branchCode: seat.seat_section,
                name: {
                    ja: `セクション${seat.seat_section}`,
                    en: `section${seat.seat_section}`
                },
                containsPlace: [],
                typeOf: placeType_1.default.ScreeningRoomSection
            });
        }
        sections[sectionCodes.indexOf(seat.seat_section)].containsPlace.push({
            branchCode: seat.seat_num,
            typeOf: placeType_1.default.Seat
        });
    });
    return {
        containsPlace: sections,
        branchCode: screenFromCOA.screen_code,
        name: {
            ja: screenFromCOA.screen_name,
            en: screenFromCOA.screen_name_eng
        },
        typeOf: placeType_1.default.ScreeningRoom
    };
}
exports.createScreeningRoomFromCOA = createScreeningRoomFromCOA;
