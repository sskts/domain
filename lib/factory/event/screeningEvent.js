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
                duration: moment.duration(filmFromCOA.showTime, 'M').toISOString(),
                contentRating: filmFromCOA.kbnEirin,
                typeOf: creativeWorkType_1.default.Movie
            },
            duration: moment.duration(filmFromCOA.showTime, 'M').toISOString(),
            endDate: endDate,
            startDate: startDate,
            coaInfo: {
                titleBranchNum: filmFromCOA.titleBranchNum,
                kbnJoueihousiki: filmFromCOA.kbnJoueihousiki,
                kbnJimakufukikae: filmFromCOA.kbnJimakufukikae,
                flgMvtkUse: filmFromCOA.flgMvtkUse,
                dateMvtkBegin: filmFromCOA.dateMvtkBegin
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
