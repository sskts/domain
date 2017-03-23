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
import * as FilmFactory from './film';
import MultilingualString from './multilingualString';
import * as ScreenFactory from './screen';

export interface IReferences {
    theater: string;
    screen: string;
    film: string;
}

export interface IReferencesWithDetails {
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
}

export interface ICOAFields {
    coa_trailer_time?: number; // トレーラー時間(トレーラー含む本編以外の時間（分）)
    coa_kbn_service?: string; // サービス区分(「通常興行」「レイトショー」など)
    coa_kbn_acoustic?: string; // 音響区分
    coa_name_service_day?: string; // サービスデイ名称(「映画の日」「レディースデイ」など ※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
    coa_available_num?: number; // 購入可能枚数
    coa_rsv_start_date?: string; // 予約開始日
    coa_flg_early_booking?: string; // 先行予約フラグ
}

export interface IPerformanceBase {
    id: string;
    day: string; // 上映日(※日付は西暦8桁 "YYYYMMDD")
    time_start: string; // 上映開始時刻
    time_end: string; // 上映終了時刻
    canceled: boolean; // 上映中止フラグ
}

export type IPerformance = IPerformanceBase & ICOAFields & IReferences;

/**
 * 劇場、作品、スクリーンの詳細ありパフォーマンスインターフェース
 */
export type IPerformanceWithReferenceDetails = IPerformanceBase & ICOAFields & IReferencesWithDetails;

export function createFromCOA(performanceFromCOA: COA.MasterService.ScheduleResult) {
    return (screen: ScreenFactory.IScreen, film: FilmFactory.IFilm): IPerformance => {
        const id = [
            screen.theater,
            performanceFromCOA.date_jouei,
            performanceFromCOA.title_code,
            performanceFromCOA.title_branch_num,
            performanceFromCOA.screen_code,
            performanceFromCOA.time_begin
        ].join('');

        return {
            id: id,
            theater: screen.theater,
            screen: screen.id,
            film: film.id,
            day: performanceFromCOA.date_jouei,
            time_start: performanceFromCOA.time_begin,
            time_end: performanceFromCOA.time_end,
            canceled: false,
            coa_trailer_time: performanceFromCOA.trailer_time,
            coa_kbn_service: performanceFromCOA.kbn_service,
            coa_kbn_acoustic: performanceFromCOA.kbn_acoustic,
            coa_name_service_day: performanceFromCOA.name_service_day,
            coa_available_num: performanceFromCOA.available_num,
            coa_rsv_start_date: performanceFromCOA.rsv_start_date
            // coa_flg_early_booking: performanceFromCOA.flg_early_booking
        };
    };
}
