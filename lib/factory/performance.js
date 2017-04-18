"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param {COA.MasterService.IScheduleResult} performanceFromCOA
 * @memberof tobereplaced$
 */
function createFromCOA(performanceFromCOA) {
    return (screen, film) => {
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
            coa_rsv_start_date: performanceFromCOA.rsv_start_date,
            coa_rsv_end_date: performanceFromCOA.rsv_end_date,
            coa_flg_early_booking: performanceFromCOA.flg_early_booking
        };
    };
}
exports.createFromCOA = createFromCOA;
