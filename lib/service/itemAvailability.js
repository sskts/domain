"use strict";
/**
 * itemAvailability service
 * @namespace service/itemAvailability
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
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:itemAvailability');
/**
 * 劇場IDと上映日範囲からパフォーマンス在庫状況を更新する
 *
 * @param {string} theaterCode 劇場コード
 * @param {string} dayStart 開始上映日(YYYYMMDD)
 * @param {string} dayEnd 終了上映日(YYYYMMDD)
 */
function updatePerformanceStockStatuses(theaterCode, dayStart, dayEnd) {
    return (itemAvailabilityRepository) => __awaiter(this, void 0, void 0, function* () {
        // COAから空席状況取得
        const countFreeSeatResult = yield COA.services.reserve.countFreeSeat({
            theaterCode: theaterCode,
            begin: dayStart,
            end: dayEnd
        });
        // 上映日ごとに
        yield Promise.all(countFreeSeatResult.listDate.map((countFreeSeatDate) => __awaiter(this, void 0, void 0, function* () {
            debug('saving individualScreeningEvent item availability... day:', countFreeSeatDate.dateJouei);
            // パフォーマンスごとに空席状況を生成して保管
            yield Promise.all(countFreeSeatDate.listPerformance.map((countFreeSeatPerformance) => __awaiter(this, void 0, void 0, function* () {
                // tslint:disable-next-line:no-suspicious-comment
                // TODO ID生成メソッドを利用する
                const eventIdentifier = [
                    countFreeSeatResult.theaterCode,
                    countFreeSeatPerformance.titleCode,
                    countFreeSeatPerformance.titleBranchNum,
                    countFreeSeatDate.dateJouei,
                    countFreeSeatPerformance.screenCode,
                    countFreeSeatPerformance.timeBegin
                ].join('');
                const itemAvailability = factory.event.individualScreeningEvent.createItemAvailability(countFreeSeatPerformance.cntReserveFree, countFreeSeatPerformance.cntReserveMax);
                // 永続化
                debug('saving item availability... identifier:', eventIdentifier);
                yield itemAvailabilityRepository.updateOne(countFreeSeatDate.dateJouei, eventIdentifier, itemAvailability);
                debug('item availability saved');
            })));
        })));
    });
}
exports.updatePerformanceStockStatuses = updatePerformanceStockStatuses;
