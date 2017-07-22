/**
 * 劇場ファクトリー
 *
 * @namespace factory/place/movieTheater
 */
import * as COA from '@motionpicture/coa-service';
import IMultilingualString from '../multilingualString';
import * as PlaceFactory from '../place';
export interface ISeat extends PlaceFactory.IPlace {
    branchCode: string;
}
export interface IScreeningRoomSection extends PlaceFactory.IPlace {
    containsPlace: ISeat[];
    branchCode: string;
}
export interface IScreeningRoom extends PlaceFactory.IPlace {
    containsPlace: IScreeningRoomSection[];
    branchCode: string;
    name: IMultilingualString;
}
export interface IPlace extends PlaceFactory.IPlace {
    containsPlace: IScreeningRoom[];
    branchCode: string;
    name: IMultilingualString;
    kanaName: string;
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
export declare function createFromCOA(theaterFromCOA: COA.services.master.ITheaterResult, screensFromCOA: COA.services.master.IScreenResult[]): IPlace;
/**
 * COAのスクリーン抽出結果から上映室を作成する
 *
 * @param {COA.services.master.ScreenResult} screenFromCOA
 * @returns {IScreeningRoom}
 * @memberof factory/place/movieTheater
 */
export declare function createScreeningRoomFromCOA(screenFromCOA: COA.services.master.IScreenResult): IScreeningRoom;
