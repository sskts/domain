/**
 * 個々の上映イベントファクトリー
 */

import * as COA from '@motionpicture/coa-service';
import * as moment from 'moment';

import CreativeWorkType from '../creativeWorkType';
import * as EventFactory from '../event';
import * as ScreeningEventFactory from '../event/screeningEvent';
import EventStatusType from '../eventStatusType';
import EventType from '../eventType';
import IMultilingualString from '../multilingualString';
import * as MovieTheaterPlaceFactory from '../place/movieTheater';
import PlaceType from '../placeType';

export interface IEvent extends EventFactory.IEvent {
    workPerformed: { // 上映作品
        identifier: string; // COAタイトルコード
        name: string; // 原題
        duration: string; // 上映時間
        contentRating: string; // 映倫区分(PG12,R15,R18)
        typeOf: CreativeWorkType
    };
    location: {
        typeOf: PlaceType;
        branchCode: string; // スクリーンコード
        name: IMultilingualString;
    };
    name: IMultilingualString;
    doorTime?: Date;
    endDate: Date; // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
    startDate: Date; // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
    superEvent: ScreeningEventFactory.IEvent;
    coaInfo: {
        theaterCode: string;
        dateJouei: string;
        titleCode: string;
        titleBranchNum: string;
        timeBegin: string;
        screenCode: string;
        trailerTime: number; // トレーラー時間(トレーラー含む本編以外の時間（分）)
        kbnService: string; // サービス区分(「通常興行」「レイトショー」など)
        kbnAcoustic: string; // 音響区分
        nameServiceDay: string; // サービスデイ名称(「映画の日」「レディースデイ」など ※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
        availableNum: number; // 購入可能枚数
        /**
         * 予約開始日
         * 予約可能になる日付(YYYYMMDD)
         */
        rsvStartDate: string; // 予約開始日
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

export function createFromCOA(performanceFromCOA: COA.services.master.IScheduleResult) {
    return (screenRoom: MovieTheaterPlaceFactory.IScreeningRoom, screeningEvent: ScreeningEventFactory.IEvent): IEvent => {
        const identifier = createIdFromCOA({
            screeningEvent: screeningEvent,
            dateJouei: performanceFromCOA.date_jouei,
            screenCode: performanceFromCOA.screen_code,
            timeBegin: performanceFromCOA.time_begin
        });

        return {
            ...EventFactory.create({
                eventStatus: EventStatusType.EventScheduled,
                typeOf: EventType.IndivisualScreeningEvent,
                identifier: identifier,
                name: screeningEvent.name
            }),
            ...{
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
            }
        };
    };
}

/**
 * COA情報からパフォーマンスIDを生成する
 */
export function createIdFromCOA(args: {
    screeningEvent: ScreeningEventFactory.IEvent,
    dateJouei: string;
    screenCode: string;
    timeBegin: string;
}): string {
    return [
        args.screeningEvent.identifier,
        args.dateJouei,
        args.screenCode,
        args.timeBegin
    ].join('');
}
