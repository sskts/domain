/**
 * パフォーマンスファクトリー
 *
 * @namespace PerformanceFactory
 */
import * as COA from '@motionpicture/coa-service';
import Film from '../model/film';
import Performace from '../model/performance';
import Screen from '../model/screen';
import Theater from '../model/theater';
export declare function create(args: {
    _id: string;
    theater: Theater;
    screen: Screen;
    film: Film;
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
}): Performace;
export declare function createFromCOA(performanceFromCOA: COA.findPerformancesByTheaterCodeInterface.Result): (screen: Screen, film: Film) => Performace;
