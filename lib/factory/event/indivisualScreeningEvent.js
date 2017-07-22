"use strict";
/**
 * 個々の上映イベントファクトリー
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const EventFactory = require("../event");
const eventStatusType_1 = require("../eventStatusType");
const eventType_1 = require("../eventType");
function createFromCOA(performanceFromCOA) {
    return (screenRoom, screeningEvent) => {
        const identifier = createIdFromCOA({
            screeningEvent: screeningEvent,
            dateJouei: performanceFromCOA.date_jouei,
            screenCode: performanceFromCOA.screen_code,
            timeBegin: performanceFromCOA.time_begin
        });
        return Object.assign({}, EventFactory.create({
            eventStatus: eventStatusType_1.default.EventScheduled,
            typeOf: eventType_1.default.IndivisualScreeningEvent,
            identifier: identifier,
            name: screeningEvent.name
        }), {
            workPerformed: screeningEvent.workPerformed,
            location: {
                typeOf: screenRoom.typeOf,
                branchCode: screenRoom.branchCode,
                name: screenRoom.name
            },
            endDate: moment(`${performanceFromCOA.date_jouei} ${performanceFromCOA.time_end}`, 'YYYYMMDD HHmm').toDate(),
            startDate: moment(`${performanceFromCOA.date_jouei} ${performanceFromCOA.time_begin}`, 'YYYYMMDD HHmm').toDate(),
            superEvent: screeningEvent,
            coaInfo: {
                theaterCode: screeningEvent.location.branchCode,
                dateJouei: performanceFromCOA.date_jouei,
                titleCode: performanceFromCOA.title_code,
                titleBranchNum: performanceFromCOA.title_branch_num,
                timeBegin: performanceFromCOA.time_begin,
                screenCode: performanceFromCOA.screen_code,
                trailerTime: performanceFromCOA.trailer_time,
                kbnService: performanceFromCOA.kbn_service,
                kbnAcoustic: performanceFromCOA.kbn_acoustic,
                nameServiceDay: performanceFromCOA.name_service_day,
                availableNum: performanceFromCOA.available_num,
                rsvStartDate: performanceFromCOA.rsv_start_date,
                rsvEndDate: performanceFromCOA.rsv_end_date,
                flgEarlyBooking: performanceFromCOA.flg_early_booking
            }
        });
    };
}
exports.createFromCOA = createFromCOA;
/**
 * COA情報からパフォーマンスIDを生成する
 */
function createIdFromCOA(args) {
    return [
        args.screeningEvent.identifier,
        args.dateJouei,
        args.screenCode,
        args.timeBegin
    ].join('');
}
exports.createIdFromCOA = createIdFromCOA;
