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
 * @param {COA.services.master.IScheduleResult} performanceFromCOA
 * @memberof tobereplaced$
 */
function createFromCOA(performanceFromCOA) {
    return (screen, film) => {
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
exports.createFromCOA = createFromCOA;
/**
 * COA情報からパフォーマンスIDを生成する
 *
 * @memberof factory/performance
 */
function createIdFromCOA(args) {
    return [
        args.theater_code,
        args.date_jouei,
        args.title_code,
        args.title_branch_num,
        args.screen_code,
        args.time_begin
    ].join('');
}
exports.createIdFromCOA = createIdFromCOA;
