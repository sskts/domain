/**
 * スクリーンファクトリー
 *
 * @namespace factory/screen
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
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
    name: MultilingualString;
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
    name: MultilingualString;
    sections: ISection[];
}
/**
 * COAのスクリーン抽出結果からScreenオブジェクトを作成する
 *
 * @param {COA.MasterService.ScreenResult} screenFromCOA
 * @memberof factory/screen
 */
export declare function createFromCOA(screenFromCOA: COA.MasterService.IScreenResult): (theater: TheaterFactory.ITheater) => IScreen;
