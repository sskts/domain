"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * COAのスクリーン抽出結果からScreenオブジェクトを作成する
 *
 * @export
 * @param {COA.MasterService.ScreenResult} screenFromCOA
 * @returns
 */
function createFromCOA(screenFromCOA) {
    return (theater) => {
        const sections = [];
        const sectionCodes = [];
        screenFromCOA.list_seat.forEach((seat) => {
            if (sectionCodes.indexOf(seat.seat_section) < 0) {
                sectionCodes.push(seat.seat_section);
                sections.push({
                    code: seat.seat_section,
                    name: {
                        ja: `セクション${seat.seat_section}`,
                        en: `section${seat.seat_section}`
                    },
                    seats: []
                });
            }
            sections[sectionCodes.indexOf(seat.seat_section)].seats.push({
                code: seat.seat_num
            });
        });
        return {
            id: `${theater.id}${screenFromCOA.screen_code}`,
            theater: theater.id,
            coa_screen_code: screenFromCOA.screen_code,
            name: {
                ja: screenFromCOA.screen_name,
                en: screenFromCOA.screen_name_eng
            },
            sections: sections
        };
    };
}
exports.createFromCOA = createFromCOA;
