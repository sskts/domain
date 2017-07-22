/**
 * 個々の上映イベントファクトリー
 */
import * as COA from '@motionpicture/coa-service';
import CreativeWorkType from '../creativeWorkType';
import * as EventFactory from '../event';
import * as ScreeningEventFactory from '../event/screeningEvent';
import IMultilingualString from '../multilingualString';
import * as MovieTheaterPlaceFactory from '../place/movieTheater';
import PlaceType from '../placeType';
export interface IEvent extends EventFactory.IEvent {
    workPerformed: {
        identifier: string;
        name: string;
        duration: string;
        contentRating: string;
        typeOf: CreativeWorkType;
    };
    location: {
        typeOf: PlaceType;
        branchCode: string;
        name: IMultilingualString;
    };
    name: IMultilingualString;
    doorTime?: Date;
    endDate: Date;
    startDate: Date;
    superEvent: ScreeningEventFactory.IEvent;
    coaInfo: {
        theaterCode: string;
        dateJouei: string;
        titleCode: string;
        titleBranchNum: string;
        timeBegin: string;
        screenCode: string;
        trailerTime: number;
        kbnService: string;
        kbnAcoustic: string;
        nameServiceDay: string;
        availableNum: number;
        /**
         * 予約開始日
         * 予約可能になる日付(YYYYMMDD)
         */
        rsvStartDate: string;
        /**
         * 予約終了日
         * 予約終了になる日付(YYYYMMDD)
         */
        rsvEndDate: string;
        /**
         * 先行予約フラグ
         * 先行予約の場合は'1'、それ以外は'0'
         */
        flgEarlyBooking: string;
    };
}
export declare function createFromCOA(performanceFromCOA: COA.services.master.IScheduleResult): (screenRoom: MovieTheaterPlaceFactory.IScreeningRoom, screeningEvent: ScreeningEventFactory.IEvent) => IEvent;
/**
 * COA情報からパフォーマンスIDを生成する
 */
export declare function createIdFromCOA(args: {
    screeningEvent: ScreeningEventFactory.IEvent;
    dateJouei: string;
    screenCode: string;
    timeBegin: string;
}): string;
