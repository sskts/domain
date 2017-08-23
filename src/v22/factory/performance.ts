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
    coa_trailer_time: number; // トレーラー時間(トレーラー含む本編以外の時間（分）)
    coa_kbn_service: string; // サービス区分(「通常興行」「レイトショー」など)
    coa_kbn_acoustic: string; // 音響区分
    coa_name_service_day: string; // サービスデイ名称(「映画の日」「レディースデイ」など ※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
    coa_available_num: number; // 購入可能枚数
    /**
     * 予約開始日
     * 予約可能になる日付(YYYYMMDD)
     */
    coa_rsv_start_date: string; // 予約開始日
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
    day: string; // 上映日(※日付は西暦8桁 "YYYYMMDD")
    time_start: string; // 上映開始時刻
    time_end: string; // 上映終了時刻
    canceled: boolean; // 上映中止フラグ
}

/**
 *
 * @memberof tobereplaced$
 */
export type IPerformance = IPerformanceBase & ICOAFields & IReferences;

/**
 * 劇場、作品、スクリーンの詳細ありパフォーマンスインターフェース
 * @memberof tobereplaced$
 */
export type IPerformanceWithReferenceDetails = IPerformanceBase & ICOAFields & IReferencesWithDetails;

/**
 *
 * @param {COA.services.master.IScheduleResult} performanceFromCOA
 * @memberof tobereplaced$
 */
export function createFromCOA(performanceFromCOA: COA.services.master.IScheduleResult) {
    return (screen: ScreenFactory.IScreen, film: FilmFactory.IFilm): IPerformance => {
        const id = createIdFromCOA({
            theater_code: screen.theater,
            date_jouei: performanceFromCOA.dateJouei,
            title_code: performanceFromCOA.titleCode,
            title_branch_num: performanceFromCOA.titleBranchNum,
            screen_code: performanceFromCOA.screenCode,
            time_begin: performanceFromCOA.timeBegin
        });

        return {
            id: id,
            theater: screen.theater,
            screen: screen.id,
            film: film.id,
            day: performanceFromCOA.dateJouei,
            time_start: performanceFromCOA.timeBegin,
            time_end: performanceFromCOA.timeEnd,
            canceled: false,
            coa_trailer_time: performanceFromCOA.trailerTime,
            coa_kbn_service: performanceFromCOA.kbnService,
            coa_kbn_acoustic: performanceFromCOA.kbnAcoustic,
            coa_name_service_day: performanceFromCOA.nameServiceDay,
            coa_available_num: performanceFromCOA.availableNum,
            coa_rsv_start_date: performanceFromCOA.rsvStartDate,
            coa_rsv_end_date: performanceFromCOA.rsvEndDate,
            coa_flg_early_booking: performanceFromCOA.flgEarlyBooking
        };
    };
}

/**
 * COA情報からパフォーマンスIDを生成する
 *
 * @memberof factory/performance
 */
export function createIdFromCOA(args: {
    theater_code: string;
    date_jouei: string;
    title_code: string;
    title_branch_num: string;
    screen_code: string;
    time_begin: string;
}): string {
    return [
        args.theater_code,
        args.date_jouei,
        args.title_code,
        args.title_branch_num,
        args.screen_code,
        args.time_begin
    ].join('');
}
