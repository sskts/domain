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

export interface IEvent extends EventFactory.IEvent {
    videoFormat: string; // 映像区分(２D、３D)
    workPerformed: { // 上映作品
        identifier: string; // COAタイトルコード
        name: string; // 原題
        duration: string; // 上映時間
        contentRating: string; // 映倫区分(PG12,R15,R18)
        typeOf: CreativeWorkType
    };
    location: {
        typeOf: PlaceType;
        branchCode: string; // 劇場コード
        name: IMultilingualString;
        kanaName: string;
    };
    // organizer: MovieTheaterOrganizationFactory.IOrganization // 提供劇場

    kanaName: string; // 作品タイトル名（カナ）
    alternativeHeadline: string; // 作品タイトル名省略
    name: IMultilingualString;

    endDate?: Date; // 公演終了予定日
    startDate?: Date; // 公演開始予定日
    coaInfo: {
        titleBranchNum: string;
        kbnJoueihousiki: string, // 上映方式区分(ＩＭＡＸ，４ＤＸ等)
        kbnJimakufukikae: string, // 字幕吹替区分(字幕、吹き替え)
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
        const endDate = (moment(filmFromCOA.date_end, 'YYYYMMDD').isValid())
            ? moment(filmFromCOA.date_end, 'YYYYMMDD').toDate()
            : undefined;
        const startDate = (moment(filmFromCOA.date_begin, 'YYYYMMDD').isValid())
            ? moment(filmFromCOA.date_begin, 'YYYYMMDD').toDate()
            : undefined;

        return {
            // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
            identifier: createIdentifier(movieTheater.branchCode, filmFromCOA.title_code, filmFromCOA.title_branch_num),
            name: {
                ja: filmFromCOA.title_name,
                en: filmFromCOA.title_name_eng
            },
            kanaName: filmFromCOA.title_name_kana,
            alternativeHeadline: filmFromCOA.title_name_short,
            location: {
                branchCode: movieTheater.branchCode,
                name: movieTheater.name,
                kanaName: movieTheater.kanaName,
                typeOf: movieTheater.typeOf
            },
            videoFormat: filmFromCOA.kbn_eizou,
            workPerformed: {
                identifier: filmFromCOA.title_code,
                name: filmFromCOA.title_name_orig,
                duration: moment.duration(filmFromCOA.show_time, 'M').toISOString(),
                contentRating: filmFromCOA.kbn_eirin,
                typeOf: CreativeWorkType.Movie
            },
            duration: moment.duration(filmFromCOA.show_time, 'M').toISOString(),
            endDate: endDate,
            startDate: startDate,
            coaInfo: {
                titleBranchNum: filmFromCOA.title_branch_num,
                kbnJoueihousiki: filmFromCOA.kbn_joueihousiki,
                kbnJimakufukikae: filmFromCOA.kbn_jimakufukikae,
                flgMvtkUse: filmFromCOA.flg_mvtk_use,
                dateMvtkBegin: filmFromCOA.date_mvtk_begin
            },
            eventStatus: EventStatusType.EventScheduled,
            typeOf: EventType.ScreeningEvent
        };
    };
}

export function createIdentifier(theaterCode: string, titleCode: string, titleBranchNum: string) {
    return `${theaterCode}${titleCode}${titleBranchNum}`;
}
