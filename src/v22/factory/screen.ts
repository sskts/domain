/**
 * スクリーンファクトリー
 *
 * @namespace factory/screen
 */

import * as COA from '@motionpicture/coa-service';
import IMultilingualString from './multilingualString';
import * as TheaterFactory from './theater';

/**
 * スクリーン座席
 *
 * @interface ISeat
 * @memberof factory/screen
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
 * @interface Section
 * @memberof factory/screen
 */
export interface ISection {
    /**
     * セクションコード
     */
    code: string;
    /**
     * セクション名称
     */
    name: IMultilingualString;
    /**
     * 座席リスト
     */
    seats: ISeat[];
}

/**
 *
 * @interface IScreen
 * @memberof tobereplaced$
 */
export interface IScreen {
    id: string;
    theater: string;
    coa_screen_code: string;
    name: IMultilingualString;
    sections: ISection[];
}

/**
 * COAのスクリーン抽出結果からScreenオブジェクトを作成する
 *
 * @param {COA.services.master.ScreenResult} screenFromCOA
 * @memberof factory/screen
 */
export function createFromCOA(screenFromCOA: COA.services.master.IScreenResult) {
    return (theater: TheaterFactory.ITheater): IScreen => {
        const sections: ISection[] = [];
        const sectionCodes: string[] = [];
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
