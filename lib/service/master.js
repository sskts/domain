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
const COA = require("@motionpicture/coa-service");
const createDebug = require("debug");
const film_1 = require("../model/film");
const performance_1 = require("../model/performance");
const screen_1 = require("../model/screen");
const theater_1 = require("../model/theater");
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
    return (repository) => __awaiter(this, void 0, void 0, function* () {
        // COAから取得
        const theaterFromCOA = yield COA.findTheaterInterface.call({
            theater_code: theaterCode
        });
        // 永続化
        const theater = theater_1.default.createFromCOA(theaterFromCOA);
        yield repository.store(theater);
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
    return (theaterRepository, filmRepo) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const optionTheater = yield theaterRepository.findById(theaterCode);
        if (optionTheater.isEmpty) {
            throw new Error('theater not found.');
        }
        // COAから作品取得
        const films = yield COA.findFilmsByTheaterCodeInterface.call({
            theater_code: theaterCode
        });
        // 永続化
        yield Promise.all(films.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const film = yield film_1.default.createFromCOA(filmFromCOA)(optionTheater.get());
            yield filmRepo.store(film);
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
    return (theaterRepository, screenRepo) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const optionTheater = yield theaterRepository.findById(theaterCode);
        if (optionTheater.isEmpty) {
            throw new Error('theater not found.');
        }
        // COAからスクリーン取得
        const screens = yield COA.findScreensByTheaterCodeInterface.call({
            theater_code: theaterCode
        });
        debug('screens.length:', screens.length);
        // 永続化
        yield Promise.all(screens.map((screenFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screen = yield screen_1.default.createFromCOA(screenFromCOA)(optionTheater.get());
            yield screenRepo.store(screen);
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
        const screens = yield screenRepo.findByTheater({ theater_id: theaterCode });
        debug('screens:', screens);
        // COAからパフォーマンス取得
        const performances = yield COA.findPerformancesByTheaterCodeInterface.call({
            theater_code: theaterCode,
            begin: dayStart,
            end: dayEnd
        });
        // パフォーマンスごとに永続化トライ
        yield Promise.all(performances.map((performanceFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screenId = `${theaterCode}${performanceFromCOA.screen_code}`;
            const filmId = `${theaterCode}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}`;
            debug('screenId:', screenId);
            debug('filmId:', filmId);
            // スクリーン存在チェック
            const screenOfPerformance = screens.find((screen) => (screen._id === screenId));
            if (!screenOfPerformance) {
                console.error('screen not found.', screenId);
                return;
            }
            // 作品取得
            const optionFilm = yield filmRepo.findById(filmId);
            if (optionFilm.isEmpty) {
                console.error('film not found.', filmId);
                return;
            }
            // 永続化
            const performance = performance_1.default.createFromCOA(performanceFromCOA)(screenOfPerformance, optionFilm.get());
            yield performanceRepo.store(performance);
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
        const performances = yield performanceRepo.find({ $and: andConditions });
        // todo 空席状況を追加
        return performances.map((performance) => {
            return {
                _id: performance._id,
                theater: {
                    _id: performance.theater._id,
                    name: performance.theater.name
                },
                screen: {
                    _id: performance.screen._id,
                    name: performance.screen.name
                },
                film: {
                    _id: performance.film._id,
                    name: performance.film.name
                },
                day: performance.day,
                time_start: performance.time_start,
                time_end: performance.time_end,
                canceled: performance.canceled
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
    return (repository) => __awaiter(this, void 0, void 0, function* () { return yield repository.findById(theaterId); });
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
    return (repository) => __awaiter(this, void 0, void 0, function* () { return yield repository.findById(filmId); });
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
    return (repository) => __awaiter(this, void 0, void 0, function* () { return yield repository.findById(screenId); });
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
    return (repository) => __awaiter(this, void 0, void 0, function* () { return yield repository.findById(performanceId); });
}
exports.findPerformance = findPerformance;
