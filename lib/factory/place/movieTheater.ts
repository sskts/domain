/**
 * 劇場ファクトリー
 *
 * @namespace factory/place/movieTheater
 */

import * as COA from '@motionpicture/coa-service';

import IMultilingualString from '../multilingualString';
import * as PlaceFactory from '../place';
import PlaceType from '../placeType';

/**
 * 場所としての座席インターフェース
 */
export interface ISeat extends PlaceFactory.IPlace {
    /**
     * 枝番号
     * COAの座席コードにあたります。
     */
    branchCode: string; // 座席コード
}

/**
 * 上映セクションインターフェース
 */
export interface IScreeningRoomSection extends PlaceFactory.IPlace {
    /**
     * 座席リスト
     */
    containsPlace: ISeat[];
    /**
     * 枝番号
     * COAのセクションコードにあたります。
     */
    branchCode: string;
}

/**
 * 場所としての上映室インターフェース
 */
export interface IScreeningRoom extends PlaceFactory.IPlace {
    /**
     * 上映セクションリスト
     */
    containsPlace: IScreeningRoomSection[];
    /**
     * 枝番号
     * COAのスクリーンコードにあたります。
     */
    branchCode: string;
    /**
     * 上映室名称
     */
    name: IMultilingualString;
}

/**
 * 劇場施設インターフェース
 */
export interface IPlace extends PlaceFactory.IPlace {
    /**
     * スクリーン数
     */
    screenCount: number;
    /**
     * 上映室リスト
     */
    containsPlace: IScreeningRoom[];
    /**
     * 枝番号
     * COAの劇場コードにあたります。
     */
    branchCode: string; // 劇場コード
    /**
     * 劇場名称
     */
    name: IMultilingualString;
    /**
     * 劇場名称(カナ)
     */
    kanaName: string;
    /**
     * 劇場住所
     */
    address?: IMultilingualString;
}

/**
 * COAのマスター抽出結果から作成する
 *
 * @param {COA.services.master.TheaterResult} theaterFromCOA
 * @param {COA.services.master.IScreenResult[]} screensFromCOA
 * @returns {IPlace}
 * @memberof factory/place/movieTheater
 */
export function createFromCOA(
    theaterFromCOA: COA.services.master.ITheaterResult,
    screensFromCOA: COA.services.master.IScreenResult[]
): IPlace {
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
        typeOf: PlaceType.MovieTheater
    };
}

/**
 * COAのスクリーン抽出結果から上映室を作成する
 *
 * @param {COA.services.master.ScreenResult} screenFromCOA
 * @returns {IScreeningRoom}
 * @memberof factory/place/movieTheater
 */
export function createScreeningRoomFromCOA(screenFromCOA: COA.services.master.IScreenResult): IScreeningRoom {
    const sections: IScreeningRoomSection[] = [];
    const sectionCodes: string[] = [];
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
                typeOf: PlaceType.ScreeningRoomSection
            });
        }

        sections[sectionCodes.indexOf(seat.seatSection)].containsPlace.push({
            branchCode: seat.seatNum,
            typeOf: PlaceType.Seat
        });
    });

    return {
        containsPlace: sections,
        branchCode: screenFromCOA.screenCode,
        name: {
            ja: screenFromCOA.screenName,
            en: screenFromCOA.screenNameEng
        },
        typeOf: PlaceType.ScreeningRoom
    };
}
