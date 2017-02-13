/**
 * 劇場ファクトリー
 *
 * @namespace TheaterFactory
 */
import * as COA from '@motionpicture/coa-service';
import MultilingualString from '../model/multilingualString';
import Theater from '../model/theater';
export declare function create(args: {
    _id: string;
    name: MultilingualString;
    name_kana: string;
    address: MultilingualString;
}): Theater;
export declare function createFromCOA(theaterFromCOA: COA.findTheaterInterface.Result): Theater;
