import MultilingualString from "../model/multilingualString";
import * as Screen from "../model/screen";
import Theater from "../model/theater";
import COA = require("@motionpicture/coa-service");
/**
 * スクリーンファクトリー
 *
 * @namespace
 */
declare namespace ScreenFactory {
    function create(args: {
        _id: string;
        theater: Theater;
        coa_screen_code: string;
        name: MultilingualString;
        sections: Screen.Section[];
    }): Screen.Screen;
    function createFromCOA(screenFromCOA: COA.findScreensByTheaterCodeInterface.Result): (theater: Theater) => Promise<Screen.Screen>;
}
export default ScreenFactory;
