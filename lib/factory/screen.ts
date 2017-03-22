/**
 * スクリーンファクトリー
 *
 * @namespace TheaterFactory
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
import * as TheaterFactory from './theater';

/**
 * スクリーン座席
 *
 *
 * @interface Seat
 */
export interface ISeat {
    /**
     * 座席コード
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
     */
    code: string;
    /**
     * セクション名称
     */
    name: MultilingualString;
    /**
     * 座席リスト
     */
    seats: ISeat[];
}

export interface IScreen {
    id: string;
    theater: string;
    coa_screen_code: string;
    name: MultilingualString;
    sections: ISection[];
}

/**
 * COAのスクリーン抽出結果からScreenオブジェクトを作成する
 *
 * @export
 * @param {COA.MasterService.ScreenResult} screenFromCOA
 */
export function createFromCOA(screenFromCOA: COA.MasterService.ScreenResult) {
    return (theater: TheaterFactory.ITheater): IScreen => {
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
