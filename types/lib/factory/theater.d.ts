/**
 * 劇場ファクトリー
 *
 * @namespace TheaterFactory
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
export interface ITheaterWithoutGMO {
    id: string;
    name: MultilingualString;
    name_kana: string;
    address: MultilingualString;
}
export declare type ITheater = ITheaterWithoutGMO & {
    gmo_site_id: string;
    gmo_shop_id: string;
    gmo_shop_pass: string;
};
/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @export
 * @param {COA.MasterService.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 */
export declare function createFromCOA(theaterFromCOA: COA.MasterService.ITheaterResult): ITheaterWithoutGMO;
