import MultilingualString from "../model/multilingualString";
import Theater from "../model/theater";
import COA = require("@motionpicture/coa-service");
/**
 * 劇場ファクトリー
 *
 * @namespace
 */
declare namespace TheaterFactory {
    function create(args: {
        _id: string;
        name: MultilingualString;
        name_kana: string;
        address: MultilingualString;
    }): Theater;
    function createFromCOA(theaterFromCOA: COA.findTheaterInterface.Result): Theater;
}
export default TheaterFactory;
