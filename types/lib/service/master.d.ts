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
export declare type TheaterOperation<T> = (repository: TheaterRepository) => Promise<T>;
export declare type FilmOperation<T> = (repository: FilmRepository) => Promise<T>;
export declare type ScreenOperation<T> = (repository: ScreenRepository) => Promise<T>;
export declare type PerformanceOperation<T> = (repository: PerformanceRepository) => Promise<T>;
export declare type TheaterAndScreenOperation<T> = (theaterRepo: TheaterRepository, screenRepo: ScreenRepository) => Promise<T>;
export declare type TheaterAndFilmOperation<T> = (theaterRepo: TheaterRepository, filmRepo: FilmRepository) => Promise<T>;
export declare type FilmAndScreenAndPerformanceOperation<T> = (filmRepo: FilmRepository, screenRepo: ScreenRepository, performanceRepo: PerformanceRepository) => Promise<T>;
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
/**
 * 劇場インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterOperation<void>}
 *
 * @memberOf MasterService
 */
export declare function importTheater(theaterCode: string): TheaterOperation<void>;
/**
 * 作品インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndFilmOperation<void>}
 *
 * @memberOf MasterService
 */
export declare function importFilms(theaterCode: string): TheaterAndFilmOperation<void>;
/**
 * スクリーンインポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndScreenOperation<void>}
 *
 * @memberOf MasterService
 */
export declare function importScreens(theaterCode: string): TheaterAndScreenOperation<void>;
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
export declare function importPerformances(theaterCode: string, dayStart: string, dayEnd: string): FilmAndScreenAndPerformanceOperation<void>;
/**
 * パフォーマンス検索
 *
 * @param {SearchPerformancesConditions} conditions
 * @returns {PerformanceOperation<Array<SearchPerformancesResult>>}
 *
 * @memberOf MasterService
 */
export declare function searchPerformances(conditions: SearchPerformancesConditions): PerformanceOperation<SearchPerformancesResult[]>;
/**
 * IDで劇場検索
 *
 * @param {string} theaterId
 * @returns {TheaterOperation<monapt.Option<Theater>>}
 *
 * @memberOf MasterService
 */
export declare function findTheater(theaterId: string): TheaterOperation<monapt.Option<Theater>>;
/**
 * IDで作品検索
 *
 * @param {string} filmId
 * @returns {FilmOperation<monapt.Option<Film>>}
 *
 * @memberOf MasterService
 */
export declare function findFilm(filmId: string): FilmOperation<monapt.Option<Film>>;
/**
 *
 *
 * @param {string} screenId
 * @returns {ScreenOperation<monapt.Option<Screen>>}
 *
 * @memberOf MasterService
 */
export declare function findScreen(screenId: string): ScreenOperation<monapt.Option<Screen>>;
/**
 * IDでパフォーマンス検索
 *
 * @param {string} performanceId
 * @returns {PerformanceOperation<monapt.Option<Performance>>}
 *
 * @memberOf MasterService
 */
export declare function findPerformance(performanceId: string): PerformanceOperation<monapt.Option<Performance>>;
