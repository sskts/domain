// tslint:disable:variable-name
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
import Theater from './theater';

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
    constructor(
        readonly id: string,
        readonly theater: Theater,
        readonly coa_screen_code: string,
        readonly name: MultilingualString,
        readonly sections: Screen.ISection[]
    ) {
        // todo validation
    }

    public toDocument(): Object {
        return {
            id: this.id,
            theater: this.theater.id,
            coa_screen_code: this.coa_screen_code,
            name: this.name,
            sections: this.sections
        };
    }
}

namespace Screen {
    /**
     * スクリーン座席
     *
     *
     * @interface Seat
     */
    export interface ISeat {
        /**
         * 座席コード
         *
         * @type {string}
         * @memberOf Seat
         */
        code: string;
    }
    /**
     * スクリーンセクション
     *
     *
     * @interface Section
     */
    export interface ISection {
        /**
         * セクションコード
         *
         * @type {string}
         * @memberOf Section
         */
        code: string;
        /**
         * セクション名称
         *
         * @type {MultilingualString}
         * @memberOf Section
         */
        name: MultilingualString;
        /**
         * 座席リスト
         *
         * @type {Array<Seat>}
         * @memberOf Section
         */
        seats: ISeat[];
    }

    export interface IScreen {
        id: string;
        theater: Theater;
        coa_screen_code: string;
        name: MultilingualString;
        sections: ISection[];
    }

    export function create(args: IScreen) {
        return new Screen(
            args.id,
            args.theater,
            args.coa_screen_code,
            args.name,
            args.sections
        );
    }

    export function createFromCOA(screenFromCOA: COA.findScreensByTheaterCodeInterface.Result) {
        return async (theater: Theater) => {
            const sections: ISection[] = [];
            const sectionCodes: string[] = [];
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
        };
    }
}

export default Screen;
