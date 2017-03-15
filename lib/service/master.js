/**
 * マスタサービス
 *
 * @namespace MasterService
 */
"use strict";
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
const monapt = require("monapt");
const Film = require("../factory/film");
const Performance = require("../factory/performance");
const Screen = require("../factory/screen");
const Theater = require("../factory/theater");
const debug = createDebug('sskts-domain:service:master');
/**
 * 劇場インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterOperation<void>}
 *
 * @memberOf MasterService
 */
function importTheater(theaterCode) {
    return (adapter) => __awaiter(this, void 0, void 0, function* () {
        // COAから取得
        const theaterFromCOA = yield COA.MasterService.theater({
            theater_code: theaterCode
        });
        // 永続化
        const theater = Theater.createFromCOA(theaterFromCOA);
        debug('storing theater...', theater);
        yield adapter.model.findByIdAndUpdate(theater.id, theater, { new: true, upsert: true }).exec();
        debug('theater stored.');
    });
}
exports.importTheater = importTheater;
/**
 * 作品インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndFilmOperation<void>}
 *
 * @memberOf MasterService
 */
function importFilms(theaterCode) {
    return (theaterAdapter, filmRepo) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const doc = yield theaterAdapter.model.findById(theaterCode).exec();
        if (!doc) {
            throw new Error('theater not found.');
        }
        const theater = doc.toObject();
        // COAから作品取得
        const films = yield COA.MasterService.title({
            theater_code: theaterCode
        });
        // 永続化
        yield Promise.all(films.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const film = yield Film.createFromCOA(filmFromCOA)(theater);
            debug('storing film...', film);
            yield filmRepo.model.findByIdAndUpdate(film.id, film, { new: true, upsert: true }).exec();
            debug('film stored.');
        })));
    });
}
exports.importFilms = importFilms;
/**
 * スクリーンインポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndScreenOperation<void>}
 *
 * @memberOf MasterService
 */
function importScreens(theaterCode) {
    return (theaterAdapter, screenRepo) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const doc = yield theaterAdapter.model.findById(theaterCode).exec();
        if (!doc) {
            throw new Error('theater not found.');
        }
        const theater = doc.toObject();
        // COAからスクリーン取得
        const screens = yield COA.MasterService.screen({
            theater_code: theaterCode
        });
        // 永続化
        yield Promise.all(screens.map((screenFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screen = Screen.createFromCOA(screenFromCOA)(theater);
            debug('storing screen...');
            yield screenRepo.model.findByIdAndUpdate(screen.id, screen, { new: true, upsert: true }).exec();
            debug('screen stored.');
        })));
    });
}
exports.importScreens = importScreens;
/**
 * パフォーマンスインポート
 *
 * @param {string} theaterCode
 * @param {string} dayStart
 * @param {string} dayEnd
 * @returns {FilmAndScreenAndPerformanceOperation<void>}
 *
 * @memberOf MasterService
 */
function importPerformances(theaterCode, dayStart, dayEnd) {
    return (filmRepo, screenRepo, performanceRepo) => __awaiter(this, void 0, void 0, function* () {
        // スクリーン取得
        const docs = yield screenRepo.model.find({ theater: theaterCode })
            .setOptions({ maxTimeMS: 10000 })
            .exec();
        const screens = docs.map((doc) => doc.toObject());
        debug('screens:', screens);
        // COAからパフォーマンス取得
        const performances = yield COA.MasterService.schedule({
            theater_code: theaterCode,
            begin: dayStart,
            end: dayEnd
        });
        // パフォーマンスごとに永続化トライ
        yield Promise.all(performances.map((performanceFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screenId = `${theaterCode}${performanceFromCOA.screen_code}`;
            const filmId = `${theaterCode}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}`;
            // スクリーン存在チェック
            const screenOfPerformance = screens.find((screen) => (screen.id === screenId));
            if (!screenOfPerformance) {
                console.error('screen not found.', screenId);
                return;
            }
            // 作品取得
            const doc = yield filmRepo.model.findById(filmId).exec();
            if (!doc) {
                console.error('film not found.', filmId);
                return;
            }
            const film = doc.toObject();
            // 永続化
            const performance = Performance.createFromCOA(performanceFromCOA)(screenOfPerformance, film);
            debug('storing performance', performance);
            yield performanceRepo.model.findByIdAndUpdate(performance.id, performance, { new: true, upsert: true }).exec();
            debug('performance stored.');
        })));
    });
}
exports.importPerformances = importPerformances;
/**
 * パフォーマンス検索
 *
 * @param {SearchPerformancesConditions} conditions
 * @returns {PerformanceOperation<Array<SearchPerformancesResult>>}
 *
 * @memberOf MasterService
 */
function searchPerformances(conditions) {
    return (performanceRepo) => __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const andConditions = [
            { _id: { $ne: null } }
        ];
        if (conditions.day) {
            andConditions.push({ day: conditions.day });
        }
        if (conditions.theater) {
            andConditions.push({ theater: conditions.theater });
        }
        debug('finding performances...', andConditions);
        const docs = yield performanceRepo.model.find({ $and: andConditions })
            .setOptions({ maxTimeMS: 10000 })
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();
        // todo 空席状況を追加
        return docs.map((doc) => {
            return {
                id: doc.get('id'),
                theater: {
                    id: doc.get('theater').id,
                    name: doc.get('theater').name
                },
                screen: {
                    id: doc.get('screen').id,
                    name: doc.get('screen').name
                },
                film: {
                    id: doc.get('film').id,
                    name: doc.get('film').name
                },
                day: doc.get('day'),
                time_start: doc.get('time_start'),
                time_end: doc.get('time_end'),
                canceled: doc.get('canceled')
            };
        });
    });
}
exports.searchPerformances = searchPerformances;
/**
 * IDで劇場検索
 *
 * @param {string} theaterId
 * @returns {TheaterOperation<monapt.Option<Theater>>}
 *
 * @memberOf MasterService
 */
function findTheater(theaterId) {
    debug('finding a theater...', theaterId);
    return (adapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield adapter.model.findById(theaterId).exec();
        return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
    });
}
exports.findTheater = findTheater;
/**
 * IDで作品検索
 *
 * @param {string} filmId
 * @returns {FilmOperation<monapt.Option<Film>>}
 *
 * @memberOf MasterService
 */
function findFilm(filmId) {
    debug('finding a film...', filmId);
    return (adapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield adapter.model.findById(filmId).exec();
        return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
    });
}
exports.findFilm = findFilm;
/**
 *
 *
 * @param {string} screenId
 * @returns {ScreenOperation<monapt.Option<Screen>>}
 *
 * @memberOf MasterService
 */
function findScreen(screenId) {
    debug('finding a screen...', screenId);
    return (adapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield adapter.model.findById(screenId).exec();
        return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
    });
}
exports.findScreen = findScreen;
/**
 * IDでパフォーマンス検索
 *
 * @param {string} performanceId
 * @returns {PerformanceOperation<monapt.Option<Performance>>}
 *
 * @memberOf MasterService
 */
function findPerformance(performanceId) {
    debug('finding a performance...', performanceId);
    return (adapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield adapter.model.findById(performanceId)
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();
        if (doc) {
            return monapt.Option({
                id: doc.get('id'),
                theater: {
                    id: doc.get('theater').id,
                    name: doc.get('theater').name
                },
                screen: {
                    id: doc.get('screen').id,
                    name: doc.get('screen').name
                },
                film: {
                    id: doc.get('film').id,
                    name: doc.get('film').name,
                    name_kana: doc.get('film').name_kana,
                    name_short: doc.get('film').name_short,
                    name_original: doc.get('film').name_original,
                    minutes: doc.get('film').minutes
                },
                day: doc.get('day'),
                time_start: doc.get('time_start'),
                time_end: doc.get('time_end'),
                canceled: doc.get('canceled')
            });
        }
        else {
            return monapt.None;
        }
    });
}
exports.findPerformance = findPerformance;
