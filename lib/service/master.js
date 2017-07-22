"use strict";
/**
 * マスタサービス
 *
 * @namespace service/master
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
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const argument_1 = require("../error/argument");
const MovieFactory = require("../factory/creativeWork/movie");
const creativeWorkType_1 = require("../factory/creativeWorkType");
const IndivisualScreeningEventFactory = require("../factory/event/indivisualScreeningEvent");
const ScreeningEventFactory = require("../factory/event/screeningEvent");
const eventType_1 = require("../factory/eventType");
const MovieTheaterPlaceFactory = require("../factory/place/movieTheater");
const placeType_1 = require("../factory/placeType");
const debug = createDebug('sskts-domain:service:master');
/**
 * 劇場インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterOperation<void>}
 *
 * @memberof service/master
 */
function importMovieTheater(theaterCode) {
    return (placeAdapter) => __awaiter(this, void 0, void 0, function* () {
        // COAから取得
        const theaterFromCOA = yield COA.services.master.theater({
            theater_code: theaterCode
        });
        // COAからスクリーン取得
        const screensFromCOA = yield COA.services.master.screen({
            theater_code: theaterCode
        });
        // 永続化
        const movieTheater = MovieTheaterPlaceFactory.createFromCOA(theaterFromCOA, screensFromCOA);
        debug('storing movieTheater...', movieTheater);
        yield placeAdapter.placeModel.findOneAndUpdate({
            branchCode: movieTheater.branchCode
        }, {
            $set: movieTheater
            // $setOnInsert: initialOptionalFields // insertの場合はオプショナルな値を初期値としてセット
        }, { upsert: true }).exec();
        debug('movieTheater stored.');
    });
}
exports.importMovieTheater = importMovieTheater;
/**
 * 作品インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndFilmOperation<void>}
 *
 * @memberof service/master
 */
function importMovies(theaterCode) {
    return (creativeWorkAdapter, eventAdapter, placeAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const movieTheaterDoc = yield placeAdapter.placeModel.findOne({
            branchCode: theaterCode,
            typeOf: placeType_1.default.MovieTheater
        }).exec();
        if (movieTheaterDoc === null) {
            throw new argument_1.default('movieTheater not found.');
        }
        const movieTheater = movieTheaterDoc.toObject();
        // COAから作品取得
        const films = yield COA.services.master.title({
            theater_code: theaterCode
        });
        // 永続化
        yield Promise.all(films.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const movie = MovieFactory.createFromCOA(filmFromCOA);
            debug('storing movie...', movie);
            yield creativeWorkAdapter.creativeWorkModel.findOneAndUpdate({
                identifier: movie.identifier,
                typeOf: creativeWorkType_1.default.Movie
            }, movie, { upsert: true }).exec();
            debug('movie stored.');
            const screeningEvent = ScreeningEventFactory.createFromCOA(filmFromCOA)(movieTheater);
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            yield eventAdapter.eventModel.findOneAndUpdate({
                identifier: screeningEvent.identifier,
                typeOf: eventType_1.default.ScreeningEvent
            }, screeningEvent, { upsert: true }).exec();
            debug('screeningEvent stored.');
        })));
    });
}
exports.importMovies = importMovies;
/**
 * スクリーンインポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndScreenOperation<void>}
 *
 * @memberof service/master
 */
// export function importScreens(theaterCode: string): TheaterAndScreenOperation<void> {
//     return async (theaterAdapter: TheaterAdapter, screenRepo: ScreenAdapter) => {
//         // 劇場取得
//         const doc = await theaterAdapter.model.findById(theaterCode).exec();
//         if (doc === null) {
//             throw new ArgumentError('theater not found.');
//         }
//         const theater = <TheaterOrganizationFactory.IOrganization>doc.toObject();
//         // COAからスクリーン取得
//         const screens = await COA.services.master.screen({
//             theater_code: theaterCode
//         });
//         // 永続化
//         await Promise.all(screens.map(async (screenFromCOA) => {
//             const screen = ScreenFactory.createFromCOA(screenFromCOA)(theater);
//             debug('storing screen...');
//             await screenRepo.model.findByIdAndUpdate(screen.id, screen, { new: true, upsert: true }).exec();
//             debug('screen stored.');
//         }));
//     };
// }
/**
 * 個々の上映会イベントインポート
 *
 * @memberof service/master
 */
function importIndivisualScreeningEvents(theaterCode, importFrom, importThrough) {
    return (eventAdapter, placeAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const placeDoc = yield placeAdapter.placeModel.findOne({
            branchCode: theaterCode,
            typeOf: placeType_1.default.MovieTheater
        }).exec();
        if (placeDoc === null) {
            throw new argument_1.default('theater not found.');
        }
        const movieTheater = placeDoc.toObject();
        // COAからパフォーマンス取得
        const performances = yield COA.services.master.schedule({
            theater_code: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });
        // パフォーマンスごとに永続化トライ
        yield Promise.all(performances.map((performanceFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screeningEventIdentifier = ScreeningEventFactory.createIdentifier(theaterCode, performanceFromCOA.title_code, performanceFromCOA.title_branch_num);
            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find((place) => place.branchCode === performanceFromCOA.screen_code);
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', performanceFromCOA.screen_code);
                return;
            }
            // 上映イベント取得
            const screeningEventDoc = yield eventAdapter.eventModel.findOne({
                identifier: screeningEventIdentifier,
                typeOf: eventType_1.default.ScreeningEvent
            }).exec();
            if (screeningEventDoc === null) {
                console.error('screeningEvent not found.', screeningEventIdentifier);
                return;
            }
            const screeningEvent = screeningEventDoc.toObject();
            // 永続化
            const indivisualScreeningEvent = IndivisualScreeningEventFactory.createFromCOA(performanceFromCOA)(screenRoom, screeningEvent);
            debug('storing indivisualScreeningEvent', indivisualScreeningEvent);
            yield eventAdapter.eventModel.findOneAndUpdate({
                identifier: indivisualScreeningEvent.identifier,
                typeOf: eventType_1.default.IndivisualScreeningEvent
            }, indivisualScreeningEvent, { new: true, upsert: true }).exec();
            debug('indivisualScreeningEvent stored.');
        })));
    });
}
exports.importIndivisualScreeningEvents = importIndivisualScreeningEvents;
/**
 * 劇場検索
 *
 * @param {ISearchTheatersConditions} searchConditions
 * @returns {TheaterOperation<ISearchTheatersResult[]>}
 *
 * @memberof service/master
 */
function searchMovieTheaters(searchConditions) {
    return (placeAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: placeType_1.default.MovieTheater
        };
        debug('searchConditions:', searchConditions);
        // todo 検索条件を指定できるように改修
        debug('finding performances...', conditions);
        const placeDocs = yield placeAdapter.placeModel.find(conditions, 'branchCode name kanaName sameAs')
            .setOptions({ maxTimeMS: 10000 })
            .exec();
        return placeDocs.map((doc) => {
            const movieTheater = doc.toObject();
            return {
                branchCode: movieTheater.branchCode,
                name: movieTheater.name,
                kanaName: movieTheater.kanaName,
                sameAs: movieTheater.sameAs
            };
        });
    });
}
exports.searchMovieTheaters = searchMovieTheaters;
/**
 * 上映イベント検索
 * 空席状況情報がなかったバージョンに対して互換性を保つために
 * performanceStockStatusAdapterはundefinedでも使えるようになっている
 *
 * @param {SearchPerformancesConditions} conditions
 * @returns {PerformanceAndPerformanceStockStatusOperation<ISearchPerformancesResult[]>}
 *
 * @memberof service/master
 */
function searchIndivisualScreeningEvents(searchConditions) {
    return (eventAdapter
        // performanceStockStatusAdapter?: PerformanceStockStatusAdapter
    ) => __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: eventType_1.default.IndivisualScreeningEvent
        };
        if (searchConditions.day !== undefined) {
            conditions.startDate = {
                $gte: moment(searchConditions.day, 'YYYYMMDD').toDate(),
                $lt: moment(searchConditions.day, 'YYYYMMDD').add(1, 'day').toDate()
            };
        }
        if (searchConditions.theater !== undefined) {
            conditions['superEvent.location.branchCode'] = searchConditions.theater;
        }
        debug('finding indivisualScreeningEvents...', conditions);
        return yield eventAdapter.eventModel.find(conditions)
            .setOptions({ maxTimeMS: 10000 })
            .lean()
            .exec();
        // const performances: ISearchPerformancesResult[] = [];
        // await Promise.all(docs.map(async (doc) => {
        //     // 空席状況を追加
        //     let stockStatus = null;
        //     if (performanceStockStatusAdapter !== undefined) {
        //         stockStatus = await performanceStockStatusAdapter.findOne(doc.get('day'), doc.get('id'));
        //         debug('stockStatus:', stockStatus);
        //     }
        //     performances.push({
        //         id: doc.get('id'),
        //         theater: {
        //             id: doc.get('theater').id,
        //             name: doc.get('theater').name
        //         },
        //         screen: {
        //             id: doc.get('screen').id,
        //             name: doc.get('screen').name
        //         },
        //         film: {
        //             id: doc.get('film').id,
        //             name: doc.get('film').name,
        //             minutes: doc.get('film').minutes
        //         },
        //         day: doc.get('day'),
        //         time_start: doc.get('time_start'),
        //         time_end: doc.get('time_end'),
        //         canceled: doc.get('canceled'),
        //         stock_status: (stockStatus === null) ? null : stockStatus.expression
        //     });
        // }));
        // return performances;
    });
}
exports.searchIndivisualScreeningEvents = searchIndivisualScreeningEvents;
/**
 * 枝番号で劇場検索
 */
function findTMovieTheaterByBranchCode(branchCode) {
    return (placeAdapter) => __awaiter(this, void 0, void 0, function* () {
        const movieTheater = yield placeAdapter.placeModel.findOne({
            typeOf: placeType_1.default.MovieTheater,
            branchCode: branchCode
        }).lean().exec();
        return (movieTheater === null) ? monapt.None : monapt.Option(movieTheater);
    });
}
exports.findTMovieTheaterByBranchCode = findTMovieTheaterByBranchCode;
/**
 * IDで上映イベント検索
 */
function findIndivisualScreeningEventByIdentifier(identifier) {
    return (eventAdapter) => __awaiter(this, void 0, void 0, function* () {
        const event = yield eventAdapter.eventModel.findOne({
            typeOf: eventType_1.default.IndivisualScreeningEvent,
            identifier: identifier
        }).lean().exec();
        return (event === null) ? monapt.None : monapt.Option(event);
    });
}
exports.findIndivisualScreeningEventByIdentifier = findIndivisualScreeningEventByIdentifier;
