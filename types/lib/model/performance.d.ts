import * as COA from '@motionpicture/coa-service';
import Film from './film';
import Screen from './screen';
import Theater from './theater';
/**
 * パフォーマンス
 *
 * @class Performance
 *
 * @param {string} id
 * @param {Theater} theater 劇場
 * @param {Screen} screen スクリーン
 * @param {Film} film 作品
 * @param {string} day 上映日(※日付は西暦8桁 "YYYYMMDD")
 * @param {string} time_start 上映開始時刻
 * @param {string} time_end 上映終了時刻
 * @param {boolean} canceled 上映中止フラグ
 */
declare class Performance {
    readonly id: string;
    readonly theater: Theater;
    readonly screen: Screen;
    readonly film: Film;
    readonly day: string;
    readonly time_start: string;
    readonly time_end: string;
    readonly canceled: boolean;
    constructor(id: string, theater: Theater, screen: Screen, film: Film, day: string, time_start: string, time_end: string, canceled: boolean);
    toDocument(): Object;
}
declare namespace Performance {
    interface IPerformance {
        id: string;
        theater: Theater;
        screen: Screen;
        film: Film;
        day: string;
        time_start: string;
        time_end: string;
        canceled: boolean;
    }
    function create(args: IPerformance): Performance;
    function createFromCOA(performanceFromCOA: COA.MasterService.FindPerformancesByTheaterCodeResult): (screen: Screen, film: Film) => Performance;
}
export default Performance;
