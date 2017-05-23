"use strict";
/**
 * 在庫状況サービス
 *
 * @namespace service/stockStatus
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const createDebug = require("debug");
const PerformanceFactory = require("../factory/performance");
const PerformanceStockStatusFactory = require("../factory/stockStatus/performance");
const debug = createDebug('sskts-domain:service:stockStatus');
/**
 * 劇場IDと上映日範囲からパフォーマンス在庫状況を更新する
 *
 * @param {string} theaterCode 劇場コード
 * @param {string} dayStart 開始上映日(YYYYMMDD)
 * @param {string} dayEnd 終了上映日(YYYYMMDD)
 */
function updatePerformanceStockStatuses(theaterCode, dayStart, dayEnd) {
    return (performanceStockStatusAdapter) => __awaiter(this, void 0, void 0, function* () {
        // COAから空席状況取得
        const countFreeSeatResult = yield COA.ReserveService.countFreeSeat({
            theater_code: theaterCode,
            begin: dayStart,
            end: dayEnd
        });
        // 上映日ごとに
        yield Promise.all(countFreeSeatResult.list_date.map((countFreeSeatDate) => __awaiter(this, void 0, void 0, function* () {
            debug('saving performance stock status... day:', countFreeSeatDate.date_jouei);
            // パフォーマンスごとに空席状況を生成して保管
            yield Promise.all(countFreeSeatDate.list_performance.map((countFreeSeatPerformance) => __awaiter(this, void 0, void 0, function* () {
                const performanceId = PerformanceFactory.createIdFromCOA({
                    theater_code: countFreeSeatResult.theater_code,
                    date_jouei: countFreeSeatDate.date_jouei,
                    title_code: countFreeSeatPerformance.title_code,
                    title_branch_num: countFreeSeatPerformance.title_branch_num,
                    screen_code: countFreeSeatPerformance.screen_code,
                    time_begin: countFreeSeatPerformance.time_begin
                });
                const stockStatusExpression = PerformanceStockStatusFactory.createExpression(countFreeSeatDate.date_jouei, countFreeSeatPerformance.cnt_reserve_free, countFreeSeatPerformance.cnt_reserve_max);
                // 永続化
                debug('saving performance stock status... id:', performanceId);
                yield performanceStockStatusAdapter.updateOne(countFreeSeatDate.date_jouei, performanceId, stockStatusExpression);
                debug('performance stock status saved');
            })));
        })));
    });
}
exports.updatePerformanceStockStatuses = updatePerformanceStockStatuses;
