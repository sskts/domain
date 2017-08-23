/**
 * パフォーマンスファクトリー
 *
 * @namespace factory/performance
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
import * as FilmFactory from './film';
import IMultilingualString from './multilingualString';
import * as ScreenFactory from './screen';
/**
 *
 * @interface IReferences
 * @memberof tobereplaced$
 */
export interface IReferences {
    theater: string;
    screen: string;
    film: string;
}
/**
 *
 * @interface IReferencesWithDetails
 * @memberof tobereplaced$
 */
export interface IReferencesWithDetails {
    theater: {
        id: string;
        name: IMultilingualString;
        name_kana: string;
        address: IMultilingualString;
    };
    screen: {
        id: string;
        name: IMultilingualString;
    };
    film: {
        id: string;
        name: IMultilingualString;
        name_kana: string;
        name_short: string;
        name_original: string;
        minutes: number;
        kbn_eirin: string;
        kbn_eizou: string;
        kbn_joueihousiki: string;
        kbn_jimakufukikae: string;
        copyright: string;
    };
}
/**
 *
 * @interface ICOAFields
 * @memberof tobereplaced$
 */
export interface ICOAFields {
    coa_trailer_time: number;
    coa_kbn_service: string;
    coa_kbn_acoustic: string;
    coa_name_service_day: string;
    coa_available_num: number;
    /**
     * 予約開始日
     * 予約可能になる日付(YYYYMMDD)
     */
    coa_rsv_start_date: string;
    /**
     * 予約終了日
     * 予約終了になる日付(YYYYMMDD)
     */
    coa_rsv_end_date: string;
    /**
     * 先行予約フラグ
     * 先行予約の場合は'1'、それ以外は'0'
     */
    coa_flg_early_booking: string;
}
/**
 *
 * @interface IPerformanceBase
 * @memberof tobereplaced$
 */
export interface IPerformanceBase {
    id: string;
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
}
/**
 *
 * @memberof tobereplaced$
 */
export declare type IPerformance = IPerformanceBase & ICOAFields & IReferences;
/**
 * 劇場、作品、スクリーンの詳細ありパフォーマンスインターフェース
 * @memberof tobereplaced$
 */
export declare type IPerformanceWithReferenceDetails = IPerformanceBase & ICOAFields & IReferencesWithDetails;
/**
 *
 * @param {COA.services.master.IScheduleResult} performanceFromCOA
 * @memberof tobereplaced$
 */
export declare function createFromCOA(performanceFromCOA: COA.services.master.IScheduleResult): (screen: ScreenFactory.IScreen, film: FilmFactory.IFilm) => IPerformance;
/**
 * COA情報からパフォーマンスIDを生成する
 *
 * @memberof factory/performance
 */
export declare function createIdFromCOA(args: {
    theater_code: string;
    date_jouei: string;
    title_code: string;
    title_branch_num: string;
    screen_code: string;
    time_begin: string;
}): string;
