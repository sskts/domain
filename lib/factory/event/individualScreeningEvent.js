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
            dateJouei: performanceFromCOA.dateJouei,
            screenCode: performanceFromCOA.screenCode,
            timeBegin: performanceFromCOA.timeBegin
        });
        return Object.assign({}, EventFactory.create({
            eventStatus: eventStatusType_1.default.EventScheduled,
            typeOf: eventType_1.default.IndividualScreeningEvent,
            identifier: identifier,
            name: screeningEvent.name
        }), {
            workPerformed: screeningEvent.workPerformed,
            location: {
                typeOf: screenRoom.typeOf,
                branchCode: screenRoom.branchCode,
                name: screenRoom.name
            },
            endDate: moment(`${performanceFromCOA.dateJouei} ${performanceFromCOA.timeEnd} +09:00`, 'YYYYMMDD HHmm Z').toDate(),
            startDate: moment(`${performanceFromCOA.dateJouei} ${performanceFromCOA.timeBegin} +09:00`, 'YYYYMMDD HHmm Z').toDate(),
            superEvent: screeningEvent,
            coaInfo: {
                theaterCode: screeningEvent.location.branchCode,
                dateJouei: performanceFromCOA.dateJouei,
                titleCode: performanceFromCOA.titleCode,
                titleBranchNum: performanceFromCOA.titleBranchNum,
                timeBegin: performanceFromCOA.timeBegin,
                screenCode: performanceFromCOA.screenCode,
                trailerTime: performanceFromCOA.trailerTime,
                kbnService: performanceFromCOA.kbnService,
                kbnAcoustic: performanceFromCOA.kbnAcoustic,
                nameServiceDay: performanceFromCOA.nameServiceDay,
                availableNum: performanceFromCOA.availableNum,
                rsvStartDate: performanceFromCOA.rsvStartDate,
                rsvEndDate: performanceFromCOA.rsvEndDate,
                flgEarlyBooking: performanceFromCOA.flgEarlyBooking
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
