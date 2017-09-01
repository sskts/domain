"use strict";
/**
 * master data synchronization service
 * マスターデータ同期サービス
 * @namespace service/masterSync
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
const moment = require("moment");
const debug = createDebug('sskts-domain:service:masterSync');
/**
 * 映画作品インポート
 */
function importMovies(theaterCode) {
    return (creativeWorkRepository) => __awaiter(this, void 0, void 0, function* () {
        // COAから作品取得
        const filmsFromCOA = yield COA.services.master.title({ theaterCode: theaterCode });
        // 永続化
        yield Promise.all(filmsFromCOA.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const movie = factory.creativeWork.movie.createFromCOA(filmFromCOA);
            debug('storing movie...', movie);
            yield creativeWorkRepository.saveMovie(movie);
            debug('movie stored.');
        })));
    });
}
exports.importMovies = importMovies;
/**
 * import screening events from COA
 * COAから上映イベントをインポートする
 * @export
 * @function
 * @memberof service/event
 */
function importScreeningEvents(theaterCode, importFrom, importThrough) {
    // tslint:disable-next-line:max-func-body-length
    return (eventRepository, placeRepository) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const movieTheaterDoc = yield placeRepository.placeModel.findOne({
            branchCode: theaterCode,
            typeOf: factory.placeType.MovieTheater
        }).exec();
        if (movieTheaterDoc === null) {
            throw new factory.errors.Argument('movieTheater not found.');
        }
        const movieTheater = movieTheaterDoc.toObject();
        // COAから作品取得
        const filmsFromCOA = yield COA.services.master.title({
            theaterCode: theaterCode
        });
        // COAからパフォーマンス取得
        const schedulesFromCOA = yield COA.services.master.schedule({
            theaterCode: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });
        // COAから区分マスター抽出
        const serviceKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '009'
        });
        const acousticKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '046'
        });
        const eirinKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '044'
        });
        const eizouKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '042'
        });
        const joueihousikiKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '045'
        });
        const jimakufukikaeKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '043'
        });
        debug(serviceKubuns, acousticKubuns, eirinKubuns, eizouKubuns, joueihousikiKubuns, jimakufukikaeKubuns);
        // 永続化
        const screeningEvents = yield Promise.all(filmsFromCOA.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screeningEvent = factory.event.screeningEvent.createFromCOA({
                filmFromCOA: filmFromCOA,
                movieTheater: movieTheater,
                eirinKubuns: eirinKubuns,
                eizouKubuns: eizouKubuns,
                joueihousikiKubuns: joueihousikiKubuns,
                jimakufukikaeKubuns: jimakufukikaeKubuns
            });
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            yield eventRepository.saveScreeningEvent(screeningEvent);
            debug('screeningEvent stored.');
            return screeningEvent;
        })));
        // パフォーマンスごとに永続化トライ
        yield Promise.all(schedulesFromCOA.map((scheduleFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screeningEventIdentifier = factory.event.screeningEvent.createIdentifier(theaterCode, scheduleFromCOA.titleCode, scheduleFromCOA.titleBranchNum);
            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find((place) => place.branchCode === scheduleFromCOA.screenCode);
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', scheduleFromCOA.screenCode);
                return;
            }
            // 上映イベント取得
            const screeningEvent = screeningEvents.find((event) => event.identifier === screeningEventIdentifier);
            if (screeningEvent === undefined) {
                console.error('screeningEvent not found.', screeningEventIdentifier);
                return;
            }
            // 永続化
            const individualScreeningEvent = factory.event.individualScreeningEvent.createFromCOA({
                performanceFromCOA: scheduleFromCOA,
                screenRoom: screenRoom,
                screeningEvent: screeningEvent,
                serviceKubuns: serviceKubuns,
                acousticKubuns: acousticKubuns
            });
            debug('storing individualScreeningEvent', individualScreeningEvent);
            yield eventRepository.saveIndividualScreeningEvent(individualScreeningEvent);
            debug('individualScreeningEvent stored.');
        })));
    });
}
exports.importScreeningEvents = importScreeningEvents;
/**
 * 劇場インポート
 */
function importMovieTheater(theaterCode) {
    return (placeRepository) => __awaiter(this, void 0, void 0, function* () {
        const movieTheater = factory.place.movieTheater.createFromCOA(yield COA.services.master.theater({ theaterCode: theaterCode }), yield COA.services.master.screen({ theaterCode: theaterCode }));
        debug('storing movieTheater...', movieTheater);
        yield placeRepository.saveMovieTheater(movieTheater);
        debug('movieTheater stored.');
    });
}
exports.importMovieTheater = importMovieTheater;
