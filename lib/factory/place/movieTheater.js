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
        screenCount: screensFromCOA.length,
        branchCode: theaterFromCOA.theaterCode,
        name: {
            ja: theaterFromCOA.theaterName,
            en: theaterFromCOA.theaterNameEng
        },
        kanaName: theaterFromCOA.theaterNameKana,
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
    screenFromCOA.listSeat.forEach((seat) => {
        if (sectionCodes.indexOf(seat.seatSection) < 0) {
            sectionCodes.push(seat.seatSection);
            sections.push({
                branchCode: seat.seatSection,
                name: {
                    ja: `セクション${seat.seatSection}`,
                    en: `section${seat.seatSection}`
                },
                containsPlace: [],
                typeOf: placeType_1.default.ScreeningRoomSection
            });
        }
        sections[sectionCodes.indexOf(seat.seatSection)].containsPlace.push({
            branchCode: seat.seatNum,
            typeOf: placeType_1.default.Seat
        });
    });
    return {
        containsPlace: sections,
        branchCode: screenFromCOA.screenCode,
        name: {
            ja: screenFromCOA.screenName,
            en: screenFromCOA.screenNameEng
        },
        typeOf: placeType_1.default.ScreeningRoom
    };
}
exports.createScreeningRoomFromCOA = createScreeningRoomFromCOA;
