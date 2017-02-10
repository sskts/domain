import Film from "../model/film";
import Performace from "../model/performance";
import Screen from "../model/screen";
import Theater from "../model/theater";
import COA = require("@motionpicture/coa-service");
/**
 * パフォーマンスファクトリー
 *
 * @namespace
 */
declare namespace PerformanceFactory {
    function create(args: {
        _id: string;
        theater: Theater;
        screen: Screen;
        film: Film;
        day: string;
        time_start: string;
        time_end: string;
        canceled: boolean;
    }): Performace;
    function createFromCOA(performanceFromCOA: COA.findPerformancesByTheaterCodeInterface.Result): (screen: Screen, film: Film) => Performace;
}
export default PerformanceFactory;
