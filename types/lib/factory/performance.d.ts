/**
 * パフォーマンスファクトリー
 *
 * @namespace TheaterFactory
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
import * as COA from '@motionpicture/coa-service';
import * as Film from './film';
import MultilingualString from './multilingualString';
import * as Screen from './screen';
export interface IPerformance {
    id: string;
    theater: string;
    screen: string;
    film: string;
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
}
export interface IPerformanceWithFilmAndScreen {
    id: string;
    theater: {
        id: string;
        name: MultilingualString;
    };
    screen: {
        id: string;
        name: MultilingualString;
    };
    film: {
        id: string;
        name: MultilingualString;
        name_kana: string;
        name_short: string;
        name_original: string;
        minutes: number;
    };
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
}
export declare function createFromCOA(performanceFromCOA: COA.MasterService.ScheduleResult): (screen: Screen.IScreen, film: Film.IFilm) => IPerformance;
