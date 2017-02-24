import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
/**
 * 劇場
 *
 * @class Theater
 *
 * @param {string} id
 * @param {MultilingualString} name 劇場名称
 * @param {string} name_kana 劇場名称(カナ)
 * @param {MultilingualString} address 劇場住所
 */
declare class Theater {
    readonly id: string;
    readonly name: MultilingualString;
    readonly name_kana: string;
    readonly address: MultilingualString;
    constructor(id: string, name: MultilingualString, name_kana: string, address: MultilingualString);
}
/**
 * 劇場
 *
 * @namespace model/theater
 */
declare namespace Theater {
    interface ITheater {
        id: string;
        name: MultilingualString;
        name_kana: string;
        address: MultilingualString;
    }
    function create(args: ITheater): Theater;
    function createFromCOA(theaterFromCOA: COA.MasterService.TheaterResult): Theater;
}
export default Theater;
