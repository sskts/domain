"use strict";
/**
 * スクリーンファクトリー
 *
 * @namespace factory/screen
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * COAのスクリーン抽出結果からScreenオブジェクトを作成する
 *
 * @param {COA.services.master.ScreenResult} screenFromCOA
 * @memberof factory/screen
 */
function createFromCOA(screenFromCOA) {
    return (theater) => {
        const sections = [];
        const sectionCodes = [];
        screenFromCOA.listSeat.forEach((seat) => {
            if (sectionCodes.indexOf(seat.seatSection) < 0) {
                sectionCodes.push(seat.seatSection);
                sections.push({
                    code: seat.seatSection,
                    name: {
                        ja: `セクション${seat.seatSection}`,
                        en: `section${seat.seatSection}`
                    },
                    seats: []
                });
            }
            sections[sectionCodes.indexOf(seat.seatSection)].seats.push({
                code: seat.seatNum
            });
        });
        return {
            id: `${theater.id}${screenFromCOA.screenCode}`,
            theater: theater.id,
            coa_screen_code: screenFromCOA.screenCode,
            name: {
                ja: screenFromCOA.screenName,
                en: screenFromCOA.screenNameEng
            },
            sections: sections
        };
    };
}
exports.createFromCOA = createFromCOA;
