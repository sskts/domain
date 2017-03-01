"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * スクリーン
 *
 * @class Screen
 *
 * @param {string} id
 * @param {Theater} theater 劇場
 * @param {string} coa_screen_code COAスクリーンコード
 * @param {MultilingualString} name スクリーン名称
 * @param {Screen.ISection[]} sections スクリーンセクションリスト
 */
class Screen {
    constructor(id, theater, coa_screen_code, name, sections) {
        this.id = id;
        this.theater = theater;
        this.coa_screen_code = coa_screen_code;
        this.name = name;
        this.sections = sections;
        // todo validation
    }
    toDocument() {
        return {
            id: this.id,
            theater: this.theater.id,
            coa_screen_code: this.coa_screen_code,
            name: this.name,
            sections: this.sections
        };
    }
}
(function (Screen) {
    function create(args) {
        return new Screen(args.id, args.theater, args.coa_screen_code, args.name, args.sections);
    }
    Screen.create = create;
    function createFromCOA(screenFromCOA) {
        return (theater) => __awaiter(this, void 0, void 0, function* () {
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
            return create({
                id: `${theater.id}${screenFromCOA.screen_code}`,
                theater: theater,
                coa_screen_code: screenFromCOA.screen_code,
                name: {
                    ja: screenFromCOA.screen_name,
                    en: screenFromCOA.screen_name_eng
                },
                sections: sections
            });
        });
    }
    Screen.createFromCOA = createFromCOA;
})(Screen || (Screen = {}));
exports.default = Screen;
