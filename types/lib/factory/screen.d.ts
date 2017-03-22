/**
 * スクリーンファクトリー
 *
 * @namespace TheaterFactory
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
import * as Theater from './theater';
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
export declare function createFromCOA(screenFromCOA: COA.MasterService.ScreenResult): (theater: Theater.ITheater) => IScreen;
