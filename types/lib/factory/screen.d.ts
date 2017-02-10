/**
 * スクリーンファクトリー
 *
 * @namespace ScreenFactory
 */
import MultilingualString from "../model/multilingualString";
import * as Screen from "../model/screen";
import Theater from "../model/theater";
import COA = require("@motionpicture/coa-service");
export declare function create(args: {
    _id: string;
    theater: Theater;
    coa_screen_code: string;
    name: MultilingualString;
    sections: Screen.Section[];
}): Screen.Screen;
export declare function createFromCOA(screenFromCOA: COA.findScreensByTheaterCodeInterface.Result): (theater: Theater) => Promise<Screen.Screen>;
