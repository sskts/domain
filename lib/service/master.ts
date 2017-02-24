/**
 * マスタサービス
 *
 * @namespace MasterService
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as monapt from 'monapt';
import Film from '../model/film';
import MultilingualString from '../model/multilingualString';
import Performance from '../model/performance';
import Screen from '../model/screen';
import Theater from '../model/theater';
import FilmRepository from '../repository/film';
import PerformanceRepository from '../repository/performance';
import ScreenRepository from '../repository/screen';
import TheaterRepository from '../repository/theater';

export type TheaterOperation<T> = (repository: TheaterRepository) => Promise<T>;
export type FilmOperation<T> = (repository: FilmRepository) => Promise<T>;
export type ScreenOperation<T> = (repository: ScreenRepository) => Promise<T>;
export type PerformanceOperation<T> = (repository: PerformanceRepository) => Promise<T>;
export type TheaterAndScreenOperation<T> =
    (theaterRepo: TheaterRepository, screenRepo: ScreenRepository) => Promise<T>;
export type TheaterAndFilmOperation<T> =
    (theaterRepo: TheaterRepository, filmRepo: FilmRepository) => Promise<T>;
export type FilmAndScreenAndPerformanceOperation<T> =
    (filmRepo: FilmRepository, screenRepo: ScreenRepository, performanceRepo: PerformanceRepository) => Promise<T>;

export interface SearchPerformancesConditions {
    day?: string;
    theater?: string;
}
export interface SearchPerformancesResult {
    id: string;
    theater: {
        id: string;
        name: MultilingualString;
    };
    screen: {
        id: string;
        name: MultilingualString;
    };
    film: {
        id: string;
        name: MultilingualString;
    };
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
}

const debug = createDebug('sskts-domain:service:master');

/**
 * 劇場インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterOperation<void>}
 *
 * @memberOf MasterService
 */
export function importTheater(theaterCode: string): TheaterOperation<void> {
    return async (repository: TheaterRepository) => {
        // COAから取得
        const theaterFromCOA = await COA.MasterService.theater({
            theater_code: theaterCode
        });

        // 永続化
        const theater = Theater.createFromCOA(theaterFromCOA);
        debug('storing theater...', theater);
        await repository.store(theater);
        debug('theater stored.');
    };
}

/**
 * 作品インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndFilmOperation<void>}
 *
 * @memberOf MasterService
 */
export function importFilms(theaterCode: string): TheaterAndFilmOperation<void> {
    return async (theaterRepository: TheaterRepository, filmRepo: FilmRepository) => {
        // 劇場取得
        const optionTheater = await theaterRepository.findById(theaterCode);
        if (optionTheater.isEmpty) {
            throw new Error('theater not found.');
        }

        // COAから作品取得
        const films = await COA.MasterService.title({
            theater_code: theaterCode
        });

        // 永続化
        await Promise.all(films.map(async (filmFromCOA) => {
            const film = await Film.createFromCOA(filmFromCOA)(optionTheater.get());
            debug('storing film...', film);
            await filmRepo.store(film);
            debug('film stored.');
        }));
    };
}

/**
 * スクリーンインポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndScreenOperation<void>}
 *
 * @memberOf MasterService
 */
export function importScreens(theaterCode: string): TheaterAndScreenOperation<void> {
    return async (theaterRepository: TheaterRepository, screenRepo: ScreenRepository) => {
        // 劇場取得
        const optionTheater = await theaterRepository.findById(theaterCode);
        if (optionTheater.isEmpty) {
            throw new Error('theater not found.');
        }

        // COAからスクリーン取得
        const screens = await COA.MasterService.screen({
            theater_code: theaterCode
        });

        // 永続化
        await Promise.all(screens.map(async (screenFromCOA) => {
            const screen = await Screen.createFromCOA(screenFromCOA)(optionTheater.get());
            debug('storing screen...');
            await screenRepo.store(screen);
            debug('screen stored.');
        }));
    };
}

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
export function importPerformances(theaterCode: string, dayStart: string, dayEnd: string):
    FilmAndScreenAndPerformanceOperation<void> {
    return async (
        filmRepo: FilmRepository,
        screenRepo: ScreenRepository,
        performanceRepo: PerformanceRepository
    ) => {
        // スクリーン取得
        const screens = await screenRepo.findByTheater(theaterCode);
        debug('screens:', screens);

        // COAからパフォーマンス取得
        const performances = await COA.MasterService.schedule({
            theater_code: theaterCode,
            begin: dayStart,
            end: dayEnd
        });

        // パフォーマンスごとに永続化トライ
        await Promise.all(performances.map(async (performanceFromCOA) => {
            const screenId = `${theaterCode}${performanceFromCOA.screen_code}`;
            const filmId = `${theaterCode}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}`;

            // スクリーン存在チェック
            const screenOfPerformance = screens.find((screen) => (screen.id === screenId));
            if (!screenOfPerformance) {
                console.error('screen not found.', screenId);
                return;
            }

            // 作品取得
            const optionFilm = await filmRepo.findById(filmId);
            if (optionFilm.isEmpty) {
                console.error('film not found.', filmId);
                return;
            }

            // 永続化
            const performance = Performance.createFromCOA(performanceFromCOA)(screenOfPerformance, optionFilm.get());
            debug('storing performance', performance);
            await performanceRepo.store(performance);
            debug('performance stored.');
        }));
    };
}

/**
 * パフォーマンス検索
 *
 * @param {SearchPerformancesConditions} conditions
 * @returns {PerformanceOperation<Array<SearchPerformancesResult>>}
 *
 * @memberOf MasterService
 */
export function searchPerformances(conditions: SearchPerformancesConditions):
    PerformanceOperation<SearchPerformancesResult[]> {
    return async (performanceRepo: PerformanceRepository): Promise<SearchPerformancesResult[]> => {
        // 検索条件を作成
        const andConditions: Object[] = [
            { _id: { $ne: null } }
        ];

        if (conditions.day) {
            andConditions.push({ day: conditions.day });
        }

        if (conditions.theater) {
            andConditions.push({ theater: conditions.theater });
        }

        debug('finding performances...', andConditions);
        const performances = await performanceRepo.find({ $and: andConditions });

        // todo 空席状況を追加

        return performances.map((performance) => {
            return {
                id: performance.id,
                theater: {
                    id: performance.theater.id,
                    name: performance.theater.name
                },
                screen: {
                    id: performance.screen.id,
                    name: performance.screen.name
                },
                film: {
                    id: performance.film.id,
                    name: performance.film.name
                },
                day: performance.day,
                time_start: performance.time_start,
                time_end: performance.time_end,
                canceled: performance.canceled
            };
        });
    };
}

/**
 * IDで劇場検索
 *
 * @param {string} theaterId
 * @returns {TheaterOperation<monapt.Option<Theater>>}
 *
 * @memberOf MasterService
 */
export function findTheater(theaterId: string): TheaterOperation<monapt.Option<Theater>> {
    debug('finding a theater...', theaterId);
    return async (repository: TheaterRepository) => await repository.findById(theaterId);
}

/**
 * IDで作品検索
 *
 * @param {string} filmId
 * @returns {FilmOperation<monapt.Option<Film>>}
 *
 * @memberOf MasterService
 */
export function findFilm(filmId: string): FilmOperation<monapt.Option<Film>> {
    debug('finding a film...', filmId);
    return async (repository: FilmRepository) => await repository.findById(filmId);
}

/**
 *
 *
 * @param {string} screenId
 * @returns {ScreenOperation<monapt.Option<Screen>>}
 *
 * @memberOf MasterService
 */
export function findScreen(screenId: string): ScreenOperation<monapt.Option<Screen>> {
    debug('finding a screen...', screenId);
    return async (repository: ScreenRepository) => await repository.findById(screenId);
}

/**
 * IDでパフォーマンス検索
 *
 * @param {string} performanceId
 * @returns {PerformanceOperation<monapt.Option<Performance>>}
 *
 * @memberOf MasterService
 */
export function findPerformance(performanceId: string): PerformanceOperation<monapt.Option<Performance>> {
    debug('finding a performance...', performanceId);
    return async (repository: PerformanceRepository) => await repository.findById(performanceId);
}
