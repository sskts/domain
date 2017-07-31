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
/**
 * 個々の上映イベントインターフェース
 * COAのスケジュールに相当します。
 */
export interface IEvent extends EventFactory.IEvent {
    /**
     * 上映作品
     */
    workPerformed: {
        /**
         * 作品識別子
         * COAタイトルコードに相当します。
         */
        identifier: string;
        /**
         * 作品原題
         */
        name: string;
        /**
         * 上映時間
         */
        duration: string;
        /**
         * 映倫区分(PG12,R15,R18)
         */
        contentRating: string;
        /**
         * スキーマタイプ
         */
        typeOf: CreativeWorkType;
    };
    /**
     * 上映場所
     */
    location: {
        /**
         * スキーマタイプ
         */
        typeOf: PlaceType;
        /**
         * スクリーンコード
         */
        branchCode: string;
        /**
         * スクリーン名称
         */
        name: IMultilingualString;
    };
    /**
     * イベント名称
     */
    name: IMultilingualString;
    /**
     * 開場日時(in ISO 8601 date format)
     */
    doorTime?: Date;
    /**
     * 終了日時(in ISO 8601 date format)
     */
    endDate: Date;
    /**
     * 開始日時(in ISO 8601 date format)
     */
    startDate: Date;
    /**
     * 親イベント
     * COAの劇場作品に相当します。
     */
    superEvent: ScreeningEventFactory.IEvent;
    /**
     * その他COA情報
     */
    coaInfo: {
        theaterCode: string;
        dateJouei: string;
        titleCode: string;
        titleBranchNum: string;
        timeBegin: string;
        screenCode: string;
        /**
         * トレーラー時間
         * トレーラー含む本編以外の時間（分）
         */
        trailerTime: number;
        /**
         * サービス区分
         * 「通常興行」「レイトショー」など
         */
        kbnService: string;
        /**
         * 音響区分
         */
        kbnAcoustic: string;
        /**
         * サービスデイ名称
         * 「映画の日」「レディースデイ」など ※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易
         */
        nameServiceDay: string;
        /**
         * 購入可能枚数
         */
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
