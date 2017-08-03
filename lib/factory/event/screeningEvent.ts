/**
 * 劇場の上映イベントファクトリー
 *
 * @namespace factory/creativeWork/movie
 */

import * as COA from '@motionpicture/coa-service';
import * as moment from 'moment';

import CreativeWorkType from '../creativeWorkType';
import * as EventFactory from '../event';
import EventStatusType from '../eventStatusType';
import EventType from '../eventType';
import IMultilingualString from '../multilingualString';
import * as MovieTheaterPlaceFactory from '../place/movieTheater';
import PlaceType from '../placeType';

/**
 * 上映イベントインターフェース
 * COAの劇場作品に相当します。
 */
export interface IEvent extends EventFactory.IEvent {
    /**
     * 映像区分(２D、３D)
     */
    videoFormat: string;
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
        typeOf: CreativeWorkType
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
         * 劇場コード
         */
        branchCode: string;
        /**
         * 場所名称
         */
        name: IMultilingualString;
        /**
         * 場所名称(カナ)
         */
        kanaName: string;
    };
    // organizer: MovieTheaterOrganizationFactory.IOrganization // 提供劇場
    /**
     * 作品タイトル名（カナ）
     */
    kanaName: string;
    /**
     * 作品タイトル名省略
     */
    alternativeHeadline: string;
    /**
     * イベント名称
     */
    name: IMultilingualString;
    /**
     * 公演終了予定日(in ISO 8601 date format)
     */
    endDate?: Date;
    /**
     * 公演開始予定日(in ISO 8601 date format)
     */
    startDate?: Date;
    /**
     * その他COA情報
     */
    coaInfo: {
        titleBranchNum: string;
        /**
         * 上映方式区分(ＩＭＡＸ，４ＤＸ等)
         */
        kbnJoueihousiki: string,
        /**
         * 字幕吹替区分(字幕、吹き替え)
         */
        kbnJimakufukikae: string,
        /**
         * ムビチケ使用フラグ
         * 1：ムビチケ使用対象
         */
        flgMvtkUse: string,
        /**
         * ムビチケ利用開始日
         * ※日付は西暦8桁 "YYYYMMDD"
         */
        dateMvtkBegin: string
    };
}

/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 */
export function createFromCOA(filmFromCOA: COA.services.master.ITitleResult) {
    return (movieTheater: MovieTheaterPlaceFactory.IPlace): IEvent => {
        const endDate = (moment(`${filmFromCOA.dateEnd} +09:00`, 'YYYYMMDD Z').isValid())
            ? moment(`${filmFromCOA.dateEnd} +09:00`, 'YYYYMMDD Z').toDate()
            : undefined;
        const startDate = (moment(`${filmFromCOA.dateBegin} +09:00`, 'YYYYMMDD Z').isValid())
            ? moment(`${filmFromCOA.dateBegin} +09:00`, 'YYYYMMDD Z').toDate()
            : undefined;

        return {
            // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
            identifier: createIdentifier(movieTheater.branchCode, filmFromCOA.titleCode, filmFromCOA.titleBranchNum),
            name: {
                ja: filmFromCOA.titleName,
                en: filmFromCOA.titleNameEng
            },
            kanaName: filmFromCOA.titleNameKana,
            alternativeHeadline: filmFromCOA.titleNameShort,
            location: {
                branchCode: movieTheater.branchCode,
                name: movieTheater.name,
                kanaName: movieTheater.kanaName,
                typeOf: movieTheater.typeOf
            },
            videoFormat: filmFromCOA.kbnEizou,
            workPerformed: {
                identifier: filmFromCOA.titleCode,
                name: filmFromCOA.titleNameOrig,
                duration: moment.duration(filmFromCOA.showTime, 'm').toISOString(),
                contentRating: filmFromCOA.kbnEirin,
                typeOf: CreativeWorkType.Movie
            },
            duration: moment.duration(filmFromCOA.showTime, 'm').toISOString(),
            endDate: endDate,
            startDate: startDate,
            coaInfo: {
                titleBranchNum: filmFromCOA.titleBranchNum,
                kbnJoueihousiki: filmFromCOA.kbnJoueihousiki,
                kbnJimakufukikae: filmFromCOA.kbnJimakufukikae,
                flgMvtkUse: filmFromCOA.flgMvtkUse,
                dateMvtkBegin: filmFromCOA.dateMvtkBegin
            },
            eventStatus: EventStatusType.EventScheduled,
            typeOf: EventType.ScreeningEvent
        };
    };
}

export function createIdentifier(theaterCode: string, titleCode: string, titleBranchNum: string) {
    return `${theaterCode}${titleCode}${titleBranchNum}`;
}
