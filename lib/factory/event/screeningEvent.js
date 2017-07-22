"use strict";
/**
 * 劇場の上映イベントファクトリー
 *
 * @namespace factory/creativeWork/movie
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const creativeWorkType_1 = require("../creativeWorkType");
const eventStatusType_1 = require("../eventStatusType");
const eventType_1 = require("../eventType");
/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 */
function createFromCOA(filmFromCOA) {
    return (movieTheater) => {
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
                typeOf: creativeWorkType_1.default.Movie
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
            eventStatus: eventStatusType_1.default.EventScheduled,
            typeOf: eventType_1.default.ScreeningEvent
        };
    };
}
exports.createFromCOA = createFromCOA;
function createIdentifier(theaterCode, titleCode, titleBranchNum) {
    return `${theaterCode}${titleCode}${titleBranchNum}`;
}
exports.createIdentifier = createIdentifier;
